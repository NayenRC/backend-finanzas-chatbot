import TelegramBot from 'node-telegram-bot-api';
import chatBotFinanceService from '../services/chatBotFinanceService.js';
import Usuario from '../models/Usuario.js';
import Gasto from '../models/Gasto.js';
import Ingreso from '../models/Ingreso.js';
import db from '../config/db.js';
import { transaction } from 'objection';

let botInstance = null;

export function startTelegramBot() {
  if (botInstance) return;

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN no definido');
    return;
  }

  const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
  botInstance = bot;

  const userSessions = new Map();
  const pendingEmailVerification = new Map();

  /* ===========================
     UTIL: asegurar usuario
  =========================== */
  async function ensureUser(telegramUser, chatId) {
    const telegramId = String(telegramUser.id);

    const usuario = await Usuario.query().findOne({ telegram_id: telegramId });
    if (usuario) {
      userSessions.set(chatId, usuario.user_id);
      return usuario.user_id;
    }

    pendingEmailVerification.set(chatId, { telegramId, telegramUser });

    await bot.sendMessage(
      chatId,
      `👋 ¡Hola ${telegramUser.first_name || 'amigo'}!\n\n` +
        `Puedo ayudarte a registrar gastos e ingresos 💰\n\n` +
        `📊 *Para ver tus métricas en el Dashboard web*, necesitas *vincular tu cuenta*.\n\n` +
        `✉️ Escribe tu *email registrado en la web* o escribe *"nuevo"* para usar solo Telegram.`
    );

    return null;
  }

  /* ===========================
     VINCULACIÓN EMAIL
  =========================== */
  async function handleEmailLink(chatId, text, pending) {
    const telegramId = pending.telegramId;
    const telegramUser = pending.telegramUser;
    const email = text.toLowerCase().trim();

    try {
      // NUEVO → crear cuenta solo Telegram
      if (email === 'nuevo') {
        const usuario = await Usuario.query().insert({
          telegram_id: telegramId,
          nombre: telegramUser.first_name || 'Usuario Telegram',
          activo: true,
        });

        pendingEmailVerification.delete(chatId);
        userSessions.set(chatId, usuario.user_id);

        await bot.sendMessage(chatId, '✅ Cuenta creada. Puedes comenzar 💸');
        return;
      }

      // Buscar usuario web
      const usuarioWeb = await Usuario.query().findOne({ email });
      if (!usuarioWeb) {
        await bot.sendMessage(
          chatId,
          '❌ No existe una cuenta web con ese email.\nRegístrate primero en la web.'
        );
        return;
      }

      // Buscar cuenta telegram-only
      const telegramUserDb = await Usuario.query().findOne({
        telegram_id: telegramId,
      });

      await transaction(Usuario.knex(), async (trx) => {
        if (telegramUserDb && telegramUserDb.user_id !== usuarioWeb.user_id) {
          // Migrar gastos
          await Gasto.query(trx)
            .patch({ user_id: usuarioWeb.user_id })
            .where('user_id', telegramUserDb.user_id);

          // Migrar ingresos
          await Ingreso.query(trx)
            .patch({ user_id: usuarioWeb.user_id })
            .where('user_id', telegramUserDb.user_id);

          // Migrar chat
          await trx('chat_mensaje')
            .where('user_id', telegramUserDb.user_id)
            .update({ user_id: usuarioWeb.user_id });

          // 🔑 LIBERAR telegram_id
          await Usuario.query(trx)
            .patch({ telegram_id: null })
            .where('user_id', telegramUserDb.user_id);
        }

        // 🔗 Asignar telegram_id a cuenta web
        await Usuario.query(trx)
          .patch({ telegram_id: telegramId })
          .where('user_id', usuarioWeb.user_id);
      });

      pendingEmailVerification.delete(chatId);
      userSessions.set(chatId, usuarioWeb.user_id);

      await bot.sendMessage(
        chatId,
        `🔗 ¡Cuenta vinculada exitosamente!\n\n` +
          `📊 Tus gastos e ingresos ahora se reflejarán en el *Dashboard web*.`
      );
    } catch (err) {
      console.error('❌ Error vinculando:', err);
      await bot.sendMessage(
        chatId,
        '❌ Ocurrió un error al vincular. Intenta nuevamente.'
      );
    }
  }

  /* ===========================
     MENSAJES
  =========================== */
  bot.on('message', async (msg) => {
    if (!msg.text) return;

    const chatId = msg.chat.id;
    const text = msg.text.trim();

    if (pendingEmailVerification.has(chatId)) {
      await handleEmailLink(chatId, text, pendingEmailVerification.get(chatId));
      return;
    }

    let userId = userSessions.get(chatId);
    if (!userId) {
      userId = await ensureUser(msg.from, chatId);
      if (!userId) return;
    }

    await bot.sendChatAction(chatId, 'typing');
    const result = await chatBotFinanceService.processMessage(userId, text);

    await bot.sendMessage(chatId, result.response);
  });

  console.log('✅ Telegram bot activo');
}
