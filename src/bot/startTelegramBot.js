import TelegramBot from 'node-telegram-bot-api';
import chatBotFinanceService from '../services/chatBotFinanceService.js';
import Usuario from '../models/Usuario.js';

export function startTelegramBot() {
  if (global.telegramBot) {
    console.log('⚠️ Bot ya iniciado, reutilizando instancia');
    return global.telegramBot;
  }

  console.log('🤖 Iniciando SmartFin Telegram Bot...');

  const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    polling: true,
  });

  global.telegramBot = bot;

  const userSessions = new Map();

  async function ensureUser(telegramUser) {
    const telegramId = String(telegramUser.id);

    let usuario = await Usuario.query().findOne({ telegram_id: telegramId });

    if (!usuario) {
      usuario = await Usuario.query().insert({
        telegram_id: telegramId,
        nombre: telegramUser.first_name || 'Usuario Telegram',
        activo: true,
      });
    }

    return usuario.user_id;
  }

  bot.on('message', async (msg) => {
    if (!msg.text) return;

    const chatId = msg.chat.id;

    try {
      let userId = userSessions.get(chatId);

      if (!userId) {
        userId = await ensureUser(msg.from);
        userSessions.set(chatId, userId);
      }

      const result = await chatBotFinanceService.processMessage(
        userId,
        msg.text
      );

      await bot.sendMessage(chatId, result.response);

    } catch (error) {
      console.error('❌ TELEGRAM BOT ERROR:', error);
      await bot.sendMessage(
        chatId,
        'Hola 👋 Tuve un problema técnico, intenta nuevamente 😊'
      );
    }
  });

  console.log('💬 Bot listo para recibir mensajes');
  return bot;
}
