import ChatMensaje from '../models/ChatMensaje.js';
import Gasto from '../models/Gasto.js';
import Ingreso from '../models/Ingreso.js';
import Categoria from '../models/Categoria.js';

/* ==================================================
    DATA ACCESS LAYER (Objection.js / Knex)
   ================================================== */

async function getChatHistory(userId, limit = 10) {
  try {
    const history = await ChatMensaje.query()
      .where('user_id', userId)
      .orderBy('creado_en', 'desc')
      .limit(limit);

    return history.reverse();
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
}

async function saveChatMessage(userId, rol, mensaje) {
  try {
    await ChatMensaje.query().insert({
      user_id: userId,
      rol,
      mensaje,
      creado_en: new Date()
    });
  } catch (error) {
    console.error('Error saving chat message:', error);
  }
}

async function getCategories(tipo) {
  return Categoria.query().where('tipo', tipo);
}

async function createExpense(userId, data) {
  return Gasto.query().insert({
    user_id: userId,
    monto: data.monto,
    descripcion: data.descripcion,
    categoria_id: data.categoria_id,
    fecha: data.fecha || new Date()
  });
}

async function createIncome(userId, data) {
  return Ingreso.query().insert({
    user_id: userId,
    monto: data.monto,
    descripcion: data.descripcion,
    categoria_id: data.categoria_id,
    fecha: data.fecha || new Date()
  });
}

// Exportamos todas las funciones como un objeto
export default {
  getChatHistory,
  saveChatMessage,
  getCategories,
  createExpense,
  createIncome
};