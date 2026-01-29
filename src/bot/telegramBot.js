import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import aiChatCommand from '../commands/aiChatCommand.js';
import Usuario from '../models/Usuario.js';

if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error('❌ TELEGRAM_BOT_TOKEN no definido');
}

let bot;

// 👇 EVITA DOBLE INICIALIZACIÓN
if (global.telegramBot) {
  console.log('⚠️ Bot ya iniciado, reutilizando instancia');
  bot = global.telegramBot;
} else {
  console.log('🤖 Iniciando SmartFin Telegram Bot (AI Mode)...');

  bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    polling: true,
  });

  global.telegramBot = bot;

  console.log('✅ SmartFin Telegram Bot activo (Modo Conversacional AI)');

  // ===== TU CÓDIGO ACTUAL =====
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

  // Prevenir duplicidad de manejadores si la instancia se reutiliza
  bot.removeAllListeners('message');

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

      const result = await aiChatCommand.processMessage(userId, text);

      let cleanResponse = result.response
        .replace(/####+\s*/g, '')
        .replace(/\*\*\*\*/g, '**');

      await bot.sendMessage(chatId, cleanResponse, { parse_mode: 'Markdown' });

    } catch (error) {
      console.error('❌ ERROR:', error);
      bot.sendMessage(chatId, '❌ Error procesando tu mensaje.');
    }
  });

  console.log('💬 Bot listo para recibir mensajes');
}

export default bot;
