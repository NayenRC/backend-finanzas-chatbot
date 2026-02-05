import TelegramBot from 'node-telegram-bot-api';
import chatBotFinanceService from '../services/chatBotFinanceService.js';
import Usuario from '../models/Usuario.js';
import Gasto from '../models/Gasto.js';
import Ingreso from '../models/Ingreso.js';
import ChatMensaje from '../models/ChatMensaje.js';
import Categoria from '../models/Categoria.js';
import MetaAhorro from '../models/MetaAhorro.js';
import db from '../config/db.js';
import { transaction } from 'objection';

let botInstance = null;

export function startTelegramBot() {
  if (botInstance) {
    console.log('⚠️ Telegram bot ya iniciado');
    return;
  }

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN no definido');
    return;
  }

  console.log('🤖 Iniciando SmartFin Telegram Bot...');

  const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
  botInstance = bot;

  const userSessions = new Map();
  const pendingEmailVerification = new Map();

  /* ===============================
     BUSCAR / CREAR USUARIO
  =============================== */
  async function ensureUser(telegramUser, chatId) {
    const telegramId = String(telegramUser.id);

    const usuario = await Usuario.query().findOne({ telegram_id: telegramId });
    if (usuario) {
      return { userId: usuario.user_id, needsLink: false };
    }

    pendingEmailVerification.set(chatId, { telegramId, telegramUser });

    await bot.sendMessage(
      chatId,
      `👋 ¡Hola ${telegramUser.first_name || 'amigo'}!\n\n` +
      `Puedo ayudarte a registrar gastos e ingresos 💰\n\n` +
      `⚠️ *Para ver tus métricas en el Dashboard web debes vincular tu cuenta.*\n\n` +
      `✉️ Escribe tu *email registrado en la web* o escribe *"nuevo"* para usar solo Telegram.`
    );

    return { userId: null, needsLink: true };
  }

  /* ===============================
     VINCULAR EMAIL
  =============================== */
  async function handleEmailLink(chatId, text, pendingData) {
    const { telegramId, telegramUser } = pendingData;
    const email = text.trim().toLowerCase();

    try {
      if (email === 'nuevo') {
        const usuario = await Usuario.query().insert({
          telegram_id: telegramId,
          nombre: telegramUser.first_name || telegramUser.username || 'Usuario Telegram',
          activo: true,
        });

        pendingEmailVerification.delete(chatId);
        userSessions.set(chatId, usuario.user_id);

        await bot.sendMessage(
          chatId,
          `✅ Cuenta creada solo para Telegram.\n\n` +
          `💡 Si luego quieres ver métricas en la web, escribe *vincular*.`
        );
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        await bot.sendMessage(chatId, `❌ Email inválido. Intenta nuevamente.`);
        return;
      }

      const usuarioWeb = await Usuario.query().findOne({ email });

      if (!usuarioWeb) {
        const usuario = await Usuario.query().insert({
          telegram_id: telegramId,
          email,
          nombre: telegramUser.first_name || telegramUser.username || 'Usuario Telegram',
          activo: true,
        });

        pendingEmailVerification.delete(chatId);
        userSessions.set(chatId, usuario.user_id);

        await bot.sendMessage(
          chatId,
          `✅ Cuenta creada y vinculada.\n\nAhora tus datos se sincronizarán con la web.`
        );
        return;
      }

      const duplicateUsuario = await Usuario.query()
        .findOne({ telegram_id: telegramId })
        .whereNot('user_id', usuarioWeb.user_id);

      await transaction(Usuario.knex(), async (trx) => {
        if (duplicateUsuario) {
          await Gasto.query(trx)
            .patch({ user_id: usuarioWeb.user_id })
            .where('user_id', duplicateUsuario.user_id);

          await Ingreso.query(trx)
            .patch({ user_id: usuarioWeb.user_id })
            .where('user_id', duplicateUsuario.user_id);

          await ChatMensaje.query(trx)
            .patch({ user_id: usuarioWeb.user_id })
            .where('user_id', duplicateUsuario.user_id);

          await Categoria.query(trx)
            .patch({ user_id: usuarioWeb.user_id })
            .where('user_id', duplicateUsuario.user_id);

          await MetaAhorro.query(trx)
            .patch({ user_id: usuarioWeb.user_id })
            .where('user_id', duplicateUsuario.user_id);

          // 🔑 LIBERAR telegram_id ANTES (CLAVE DEL BUG)
          await Usuario.query(trx)
            .patch({ telegram_id: null })
            .where('user_id', duplicateUsuario.user_id);
        }

        await Usuario.query(trx)
          .patch({ telegram_id: telegramId })
          .where('user_id', usuarioWeb.user_id);
      });

      pendingEmailVerification.delete(chatId);
      userSessions.set(chatId, usuarioWeb.user_id);

      await bot.sendMessage(
        chatId,
        `🔗 ¡Cuenta vinculada exitosamente!\n\n` +
        `📊 Tus métricas ahora aparecerán en el Dashboard web.`
      );

    } catch (err) {
      console.error('❌ Error vinculando cuenta:', err);
      await bot.sendMessage(
        chatId,
        `❌ Ocurrió un error al vincular tu cuenta.\nIntenta nuevamente.`
      );
    }
  }

  /* ===============================
     MENSAJES
  =============================== */
  bot.on('message', async (msg) => {
    if (!msg.text) return;

    const chatId = msg.chat.id;
    const text = msg.text.trim();

    try {
      if (text.toLowerCase() === 'vincular') {
        pendingEmailVerification.set(chatId, {
          telegramId: String(msg.from.id),
          telegramUser: msg.from,
        });

        await bot.sendMessage(
          chatId,
          `🔗 Escribe tu email registrado en la web:`
        );
        return;
      }

      if (pendingEmailVerification.has(chatId)) {
        await handleEmailLink(chatId, text, pendingEmailVerification.get(chatId));
        return;
      }

      let userId = userSessions.get(chatId);
      if (!userId) {
        const result = await ensureUser(msg.from, chatId);
        if (result.needsLink) return;
        userId = result.userId;
        userSessions.set(chatId, userId);
      }

      await bot.sendChatAction(chatId, 'typing');

      const result = await chatBotFinanceService.processMessage(userId, text);
      await bot.sendMessage(chatId, result?.response || '🤖 No pude responder.');

    } catch (err) {
      console.error('❌ TELEGRAM BOT ERROR:', err);
      await bot.sendMessage(chatId, '❌ Ocurrió un error.');
    }
  });

  bot.on('polling_error', (e) => {
    console.error('❌ Polling error:', e.message);
  });

  console.log('✅ Telegram bot activo');
}
