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
    polling: {
      interval: 300,
      autoStart: true,
      params: {
        timeout: 10
      }
    }
  });

  global.telegramBot = bot;

  // Handle polling errors
  bot.on('polling_error', (error) => {
    console.error('❌ Polling Error:', error.code, error.message);

    if (error.code === 'ETELEGRAM' && error.message.includes('409')) {
      console.error('\n⚠️  CONFLICTO DETECTADO ⚠️');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Hay otra instancia del bot corriendo.');
      console.error('');
      console.error('Posibles causas:');
      console.error('  1. El bot está desplegado en Railway/Heroku/Vercel');
      console.error('  2. Hay otra terminal con el bot corriendo');
      console.error('  3. Otra aplicación está usando el mismo bot token');
      console.error('');
      console.error('Soluciones:');
      console.error('  • Detén el bot en producción temporalmente');
      console.error('  • O crea un bot de desarrollo separado con @BotFather');
      console.error('  • O cierra todas las otras terminales con Node.js');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
  });

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
      console.error('❌ ERROR COMPLETO:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      bot.sendMessage(chatId, `❌ Error procesando tu mensaje.\n\nDetalles: ${error.message}`);
    }
  });

  console.log('💬 Bot listo para recibir mensajes');
}

export default bot;
