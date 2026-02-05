import ChatMensaje from '../models/ChatMensaje.js';
import openRouterService from './openRouterService.js';

async function processMessage(user_id, userMessage) {

  // 1️⃣ Guardar mensaje del usuario
  await ChatMensaje.create({
    user_id,
    rol: 'user',
    mensaje: userMessage
  });

  // 2️⃣ Obtener respuesta del bot
  const botReply = await openRouterService.sendMessage(userMessage);

  // 3️⃣ Guardar respuesta del bot
  await ChatMensaje.create({
    user_id,
    rol: 'assistant',
    mensaje: botReply
  });

  return botReply;
}

async function getChatHistory(user_id) {
  return ChatMensaje.getByUser(user_id);
}

export default {
  processMessage,
  getChatHistory
};
