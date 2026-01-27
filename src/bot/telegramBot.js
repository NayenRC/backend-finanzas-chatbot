import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import aiChatCommand from '../commands/aiChatCommand.js';
import Usuario from '../models/Usuario.js';

// 🔐 Validaciones
if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error('❌ TELEGRAM_BOT_TOKEN no definido');
}

console.log('🤖 Iniciando SmartFin Telegram Bot (AI Mode)...');

// 🤖 Crear bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true,
});

// Mapeo de chatId a userId (en memoria)
const userSessions = new Map();

console.log('✅ SmartFin Telegram Bot activo (Modo Conversacional AI)');

/**
 * Auto-login: Encuentra o crea usuario basado en telegram_id
 */
async function ensureUser(telegramUser) {
  const telegramId = String(telegramUser.id);

  // Buscar usuario existente
  let usuario = await Usuario.query().findOne({ telegram_id: telegramId });

  // Si no existe, crear uno nuevo
  if (!usuario) {
    console.log(`✨ Creando nuevo usuario: ${telegramUser.first_name} (${telegramId})`);
    usuario = await Usuario.query().insert({
      telegram_id: telegramId,
      nombre: telegramUser.first_name || telegramUser.username || 'Usuario Telegram',
      activo: true
    });
  }

  return usuario.user_id;
}

/**
 * UNIVERSAL MESSAGE HANDLER
 * Procesa TODOS los mensajes con IA (sin comandos)
 */
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Ignorar mensajes sin texto
  if (!text) {
    return;
  }

  try {
    // Auto-login: Obtener o crear usuario
    let userId = userSessions.get(chatId);

    if (!userId) {
      userId = await ensureUser(msg.from);
      userSessions.set(chatId, userId);
      console.log(`👤 Usuario ${userId} conectado al chat ${chatId}`);
    }

    // Notificar que el bot está "escribiendo..."
    bot.sendChatAction(chatId, 'typing');

    // Procesar mensaje con AI Command (igual que zdebug)
    const result = await aiChatCommand.processMessage(userId, text);

    // Limpiar símbolos ### que Telegram no soporta
    let cleanResponse = result.response
      .replace(/####+\s*/g, '')  // Eliminar ### y ####
      .replace(/\*\*\*\*/g, '**'); // Convertir **** a **

    // Enviar respuesta con formato Markdown
    try {
      await bot.sendMessage(chatId, cleanResponse, { parse_mode: 'Markdown' });
    } catch (err) {
      // Si Markdown falla (caracteres especiales), enviar texto plano
      console.log('⚠️ Markdown falló, enviando texto plano...');
      await bot.sendMessage(chatId, cleanResponse);
    }

  } catch (error) {
    console.error('❌ ERROR procesando mensaje:', error);
    bot.sendMessage(chatId, '❌ Lo siento, tuve un problema procesando tu mensaje. Por favor intenta de nuevo.');
  }
});

console.log('💬 Bot listo para recibir mensajes conversacionales');
