import TelegramBot from 'node-telegram-bot-api';
import chatBotFinanceService from '../services/chatBotFinanceService.js';
import Usuario from '../models/Usuario.js';
import Gasto from '../models/Gasto.js';
import Ingreso from '../models/Ingreso.js';
import ChatMensaje from '../models/ChatMensaje.js';
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

  const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    polling: true,
  });

  botInstance = bot;

  const userSessions = new Map();
  const pendingEmailVerification = new Map(); // Usuarios esperando vincular email

  /**
   * Buscar o vincular usuario
   */
  async function ensureUser(telegramUser, chatId) {
    const telegramId = String(telegramUser.id);

    // 1. Buscar si ya existe usuario con este telegram_id
    let usuario = await Usuario.query().findOne({ telegram_id: telegramId });

    if (usuario) {
      return { userId: usuario.user_id, needsLink: false };
    }

    // 2. Usuario nuevo - preguntar si quiere vincular
    pendingEmailVerification.set(chatId, { telegramId, telegramUser });
    
    await bot.sendMessage(chatId, 
      `👋 ¡Hola ${telegramUser.first_name || 'amigo'}!\n\n` +
      `Para sincronizar tus datos con la app web, escribe tu **email** registrado.\n\n` +
      `Si no tienes cuenta web, escribe "nuevo" para crear una cuenta solo de Telegram.`
    );

    return { userId: null, needsLink: true };
  }

  /**
   * Procesar vinculación de email
   */
  async function handleEmailLink(chatId, text, pendingData) {
    const { telegramId, telegramUser } = pendingData;
    const input = text.trim();

    try {
      const lower = input.toLowerCase();

      // Si escribe "nuevo", crear cuenta sin email
      if (lower === 'nuevo' || lower === 'nueva') {
        const usuario = await Usuario.query().insert({
          telegram_id: telegramId,
          nombre: telegramUser.first_name || telegramUser.username || 'Usuario Telegram',
          activo: true,
        });

        pendingEmailVerification.delete(chatId);
        userSessions.set(chatId, usuario.user_id);

        await bot.sendMessage(chatId,
          `✅ ¡Cuenta creada!\n\n` +
          `Ahora puedes registrar gastos e ingresos. Tus datos estarán solo en Telegram.\n\n` +
          `💡 Si después quieres vincular con la web, escribe "vincular".`
        );
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(lower)) {
        await bot.sendMessage(chatId,
          `❌ Eso no parece un email válido.\n\nEscribe tu email o "nuevo" para continuar sin vincular.`
        );
        return;
      }

      const email = lower;

      // Buscar usuario con ese email
      const usuarioWeb = await Usuario.query().findOne({ email });

      if (usuarioWeb) {
        // Buscar posible cuenta Telegram-only existente con este telegramId
        const duplicateUsuario = await Usuario.query()
          .findOne({ telegram_id: telegramId })
          .whereNot('user_id', usuarioWeb.user_id);

        if (duplicateUsuario) {
          // Contar registros a migrar
          const gastosCntRow = await Gasto.query()
            .count('id_gasto as cnt')
            .where('user_id', duplicateUsuario.user_id)
            .first();
          const ingresosCntRow = await Ingreso.query()
            .count('id_ingreso as cnt')
            .where('user_id', duplicateUsuario.user_id)
            .first();
          const chatsCntRow = await ChatMensaje.query()
            .count('id_chat as cnt')
            .where('user_id', duplicateUsuario.user_id)
            .first();

          const gastosCnt = Number(gastosCntRow?.cnt || 0);
          const ingresosCnt = Number(ingresosCntRow?.cnt || 0);
          const chatsCnt = Number(chatsCntRow?.cnt || 0);

          try {
            await transaction(Usuario.knex(), async (trx) => {
              if (gastosCnt > 0) {
                await Gasto.query(trx)
                  .patch({ user_id: usuarioWeb.user_id })
                  .where('user_id', duplicateUsuario.user_id);
              }
              if (ingresosCnt > 0) {
                await Ingreso.query(trx)
                  .patch({ user_id: usuarioWeb.user_id })
                  .where('user_id', duplicateUsuario.user_id);
              }
              if (chatsCnt > 0) {
                await ChatMensaje.query(trx)
                  .patch({ user_id: usuarioWeb.user_id })
                  .where('user_id', duplicateUsuario.user_id);
              }

              // Vincular telegram_id a la cuenta web y eliminar la cuenta temporal
              await Usuario.query(trx)
                .patch({ telegram_id: telegramId })
                .where('user_id', usuarioWeb.user_id);
              await Usuario.query(trx).deleteById(duplicateUsuario.user_id);
            });

            pendingEmailVerification.delete(chatId);
            userSessions.set(chatId, usuarioWeb.user_id);

            await bot.sendMessage(chatId,
              `🔗 ¡Cuenta vinculada exitosamente!\n\n` +
              `Se migraron ${gastosCnt} gastos, ${ingresosCnt} ingresos y ${chatsCnt} mensajes desde tu cuenta de Telegram.`
            );
          } catch (err) {
            console.error('❌ Error migrando datos al vincular cuenta:', err);
            await bot.sendMessage(chatId, `❌ Ocurrió un error al migrar tus datos. Intenta nuevamente.`);
          }
        } else {
          // Vincular telegram_id a la cuenta existente
          await Usuario.query()
            .patch({ telegram_id: telegramId })
            .where('user_id', usuarioWeb.user_id);

          pendingEmailVerification.delete(chatId);
          userSessions.set(chatId, usuarioWeb.user_id);

          await bot.sendMessage(chatId,
            `🔗 ¡Cuenta vinculada exitosamente!\n\n` +
            `Ahora tus gastos e ingresos se verán tanto aquí como en la app web.\n\n` +
            `¿En qué te puedo ayudar? 💰`
          );
        }
      } else {
        // No existe cuenta con ese email - crear nueva con email
        const usuario = await Usuario.query().insert({
          telegram_id: telegramId,
          email: email,
          nombre: telegramUser.first_name || telegramUser.username || 'Usuario Telegram',
          activo: true,
        });

        pendingEmailVerification.delete(chatId);
        userSessions.set(chatId, usuario.user_id);

        await bot.sendMessage(chatId,
          `✅ ¡Cuenta creada con email ${email}!\n\n` +
          `Cuando te registres en la web con este mismo email, tus datos estarán sincronizados.\n\n` +
          `¿En qué te puedo ayudar? 💰`
        );
      }
    } catch (err) {
      console.error('❌ Error en handleEmailLink:', err);
      // Envío temporal del mensaje de error al usuario para depuración
      await bot.sendMessage(chatId, `❌ Ocurrió un error. Intenta de nuevo.\n\nError: ${err.message}`);
    }
  }

  bot.on('message', async (msg) => {
    if (!msg.text) return;

    try {
      const chatId = msg.chat.id;
      const text = msg.text.trim();

      // Comando para vincular manualmente
      if (text.toLowerCase() === 'vincular' || text.toLowerCase() === '/vincular') {
        const telegramId = String(msg.from.id);
        const usuario = await Usuario.query().findOne({ telegram_id: telegramId });
        
        if (usuario?.email) {
          await bot.sendMessage(chatId, `✅ Ya estás vinculado con: ${usuario.email}`);
          return;
        }

        pendingEmailVerification.set(chatId, { telegramId, telegramUser: msg.from });
        await bot.sendMessage(chatId, 
          `🔗 Para vincular tu cuenta, escribe tu email registrado en la web:`
        );
        return;
      }

      // Si hay vinculación pendiente, procesar email
      if (pendingEmailVerification.has(chatId)) {
        await handleEmailLink(chatId, text, pendingEmailVerification.get(chatId));
        return;
      }

      // Verificar sesión o crear usuario
      let userId = userSessions.get(chatId);

      if (!userId) {
        const result = await ensureUser(msg.from, chatId);
        if (result.needsLink) return; // Esperando email
        userId = result.userId;
        userSessions.set(chatId, userId);
      }

      await bot.sendChatAction(chatId, 'typing');

      const result = await chatBotFinanceService.processMessage(userId, text);

      await bot.sendMessage(
        chatId,
        result?.response || '🤖 Estoy activo, pero no pude responder.'
      );
    } catch (err) {
      console.error('❌ TELEGRAM BOT ERROR:', err);
      await bot.sendMessage(msg.chat.id, '❌ Ocurrió un error. Intenta de nuevo.');
    }
  });

  bot.on('polling_error', (e) => {
    console.error('❌ Polling error:', e.message);
  });

  console.log('✅ Telegram bot activo');
}
