import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';

const API = process.env.API_URL || 'http://localhost:3000/api';


// 🔐 Validaciones duras
if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error('❌ TELEGRAM_BOT_TOKEN no definido');
}

if (!process.env.API_URL) {
  throw new Error('❌ API_URL no definido');
}

console.log('🌐 API USADA POR TELEGRAM:', process.env.API_URL);

// 🤖 Crear bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true,
});

// ⚠️ Axios forzado a HTTP
const api = axios.create({
  baseURL: process.env.API_URL,
  timeout: 5000,
  timeout: 60000, // Aumentamos a 60s para dar tiempo a la IA y DB
  headers: {
    'Content-Type': 'application/json',
  },
});

// Guardar tokens por chat
const sessions = new Map();

console.log('🤖 SmartFin Telegram Bot activo');

/**
 * START / LOGIN TELEGRAM
 */
bot.onText(/\/start/, async msg => {
  const chatId = msg.chat.id;
  console.log('📩 Mensaje /start recibido:', msg);

  try {
    console.log('🔐 LOGIN TELEGRAM');
    console.log('Telegram ID:', msg.from.id);

    const res = await api.post('/telegram/login', {
      telegram_id: String(msg.from.id),
      username: msg.from.username || null,
      nombre: msg.from.first_name || 'Usuario Telegram',
    });

    sessions.set(chatId, res.data.token);

    bot.sendMessage(
      chatId,
      `✅ Bienvenido ${msg.from.first_name}\n\n` +
      `Usa:\n` +
      `/gasto monto descripción\n` +
      `/ingreso monto descripción\n` +
      `/verbalance - Ver resumen del mes`
    );
  } catch (error) {
    console.error('❌ ERROR LOGIN TELEGRAM:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    bot.sendMessage(chatId, '❌ Error al iniciar sesión');
  }
});

/**
 * REGISTRAR GASTO
 */
bot.onText(/\/gasto (\d+) (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const token = sessions.get(chatId);

  if (!token) {
    return bot.sendMessage(chatId, '⚠️ Usa /start primero');
  }

  try {
    await api.post(
      '/telegram/gastos', // ✅ CAMBIO: Usamos la ruta dedicada de Telegram
      {
        monto: Number(match[1]),
        descripcion: match[2],
        fecha: new Date().toISOString(),
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    bot.sendMessage(chatId, '💸 Gasto registrado');
  } catch (error) {
    console.error('❌ ERROR GASTO:', error.response?.data || error.message);
    bot.sendMessage(chatId, '❌ Error al registrar gasto');
  }
});

/**
 * REGISTRAR INGRESO
 */
bot.onText(/\/ingreso (\d+) (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const token = sessions.get(chatId);

  if (!token) {
    return bot.sendMessage(chatId, '⚠️ Usa /start primero');
  }

  try {
    await api.post(
      '/telegram/ingresos', // ✅ CAMBIO: Usamos la ruta dedicada de Telegram
      {
        monto: Number(match[1]),
        descripcion: match[2],
        fecha: new Date().toISOString(),
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    bot.sendMessage(chatId, '💰 Ingreso registrado');
  } catch (error) {
    console.error('❌ ERROR INGRESO:', error.response?.data || error.message);
    bot.sendMessage(chatId, '❌ Error al registrar ingreso');
  }
});

/**
 * VER BALANCE
 */
bot.onText(/\/verbalance/, async (msg) => {
  const chatId = msg.chat.id;
  const token = sessions.get(chatId);

  if (!token) {
    return bot.sendMessage(chatId, '⚠️ Usa /start primero');
  }

  try {
    const res = await api.get('/telegram/balance', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { periodo, ingresos, gastos, balance, lista_ingresos, lista_gastos } = res.data;
    
    let mensaje = `📊 Balance Financiero (${periodo})\n\n`;

    // Helper para formatear números
    const fmt = (n) => Number(n).toLocaleString('es-CL');

    // Listar Ingresos
    if (lista_ingresos && lista_ingresos.length > 0) {
      mensaje += `📥 Ingresos:\n`;
      // Mostramos solo los últimos 10 para evitar errores por mensaje muy largo
      lista_ingresos.slice(0, 10).forEach(i => {
        mensaje += `+ $${fmt(i.monto)} | ${i.descripcion}\n`;
      });
      if (lista_ingresos.length > 10) mensaje += `... (+${lista_ingresos.length - 10} más)\n`;
      mensaje += `\n`;
    } else {
      mensaje += `📥 Ingresos: (Sin movimientos)\n\n`;
    }

    // Listar Gastos
    if (lista_gastos && lista_gastos.length > 0) {
      mensaje += `📤 Gastos:\n`;
      lista_gastos.slice(0, 10).forEach(g => {
        mensaje += `- $${fmt(g.monto)} | ${g.descripcion}\n`;
      });
      if (lista_gastos.length > 10) mensaje += `... (+${lista_gastos.length - 10} más)\n`;
      mensaje += `\n`;
    } else {
      mensaje += `📤 Gastos: (Sin movimientos)\n\n`;
    }

    mensaje += `-----------------------------\n` +
      ` Total Ingresos: $${fmt(ingresos)}\n` +
      `💸 Total Gastos: $${fmt(gastos)}\n` +
      `⚖️ Balance Neto: $${fmt(balance)} ${balance >= 0 ? '🟢' : '🔴'}`;

    // Enviamos sin parse_mode para evitar errores si las descripciones tienen caracteres raros
    await bot.sendMessage(chatId, mensaje);

  } catch (error) {
    console.error('❌ ERROR BALANCE:', error.response?.data || error.message);
    bot.sendMessage(chatId, '❌ Error al obtener el balance');
  }
});

/**
 * AI CHAT HANDLER (Mensajes de texto normales)
 */
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Ignorar comandos que empiezan con '/'
  if (!text || text.startsWith('/')) {
    return;
  }

  const token = sessions.get(chatId);

  if (!token) {
    return bot.sendMessage(chatId, '⚠️ Por favor inicia sesión primero con /start');
  }

  // Notificar que el bot está "escribiendo..."
  bot.sendChatAction(chatId, 'typing');

  try {
    const res = await api.post(
      '/telegram/chat',
      { mensaje: text },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const { response, intent } = res.data;

    // Responder al usuario con la respuesta de la IA
    bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
    // Intentamos enviar con Markdown, si falla (por caracteres raros), enviamos plano
    try {
      await bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
    } catch (err) {
      console.log('⚠️ Markdown falló, enviando texto plano...');
      await bot.sendMessage(chatId, response);
    }

  } catch (error) {
    console.error('❌ ERROR AI CHAT:', error.response?.data || error.message);
    bot.sendMessage(chatId, '❌ Lo siento, tuve un problema procesando tu mensaje.');
  }
});
