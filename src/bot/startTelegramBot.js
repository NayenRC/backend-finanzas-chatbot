import TelegramBot from 'node-telegram-bot-api';
import chatBotFinanceService from '../services/chatBotFinanceService.js';
import Usuario from '../models/Usuario.js';

export function startTelegramBot() {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN no definido');
    return;
  }

  console.log('🤖 Iniciando SmartFin Telegram Bot...');

  const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    polling: true,
  });

  const userSessions = new Map();

  async function ensureUser(telegramUser) {
    const telegramId = String(telegramUser.id);

    let usuario = await Usuario.query().findOne({ telegram_id: telegramId });

    if (!usuario) {
      usuario = await Usuario.query().insert({
        telegram_id: telegramId,
        nombre: telegramUser.first_name || telegramUser.username || 'Usuario Telegram',
        activo: true,
      });
    }

    return usuario.user_id;
  }

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    if (!text) return;

    try {
      let userId = userSessions.get(chatId);

      if (!userId) {
        userId = await ensureUser(msg.from);
        userSessions.set(chatId, userId);
      }

      await bot.sendChatAction(chatId, 'typing');

      const result = await chatBotFinanceService.processMessage(userId, text);

      await bot.sendMessage(
        chatId,
        result?.response || 'Estoy activo pero no pude responder 🤖'
      );
    } catch (err) {
      console.error('❌ BOT ERROR:', err);
      await bot.sendMessage(chatId, 'Error interno 😕');
    }
  });

  bot.on('polling_error', (e) => {
    console.error('❌ Polling error:', e.message);
  });

  console.log('💬 Bot listo para recibir mensajes');
}
