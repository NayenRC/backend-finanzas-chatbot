import TelegramBot from 'node-telegram-bot-api';
import chatBotFinanceService from '../services/chatBotFinanceService.js';
import Usuario from '../models/Usuario.js';

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
    if (!msg.text) return;

    try {
      const chatId = msg.chat.id;
      let userId = userSessions.get(chatId);

      if (!userId) {
        userId = await ensureUser(msg.from);
        userSessions.set(chatId, userId);
      }

      await bot.sendChatAction(chatId, 'typing');

      const result = await chatBotFinanceService.processMessage(userId, msg.text);

      await bot.sendMessage(
        chatId,
        result?.response || '🤖 Estoy activo, pero no pude responder.'
      );
    } catch (err) {
      console.error('❌ TELEGRAM BOT ERROR:', err);
    }
  });

  bot.on('polling_error', (e) => {
    console.error('❌ Polling error:', e.message);
  });

  console.log('✅ Telegram bot activo');
}
