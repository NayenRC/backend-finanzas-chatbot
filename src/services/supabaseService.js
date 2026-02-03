import ChatMensaje from '../models/ChatMensaje.js';
import Gasto from '../models/Gasto.js';
import Ingreso from '../models/Ingreso.js';
import Categoria from '../models/Categoria.js';
import Usuario from '../models/Usuario.js';

/* ==================================================
   DATA ACCESS LAYER
   Usa SOLO Objection.js / Knex
================================================== */

async function getChatHistory(userId, limit = 6) {
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

async function findCategoryByName(name, tipo) {
  if (!name) return null;

  return Categoria.query()
    .where('tipo', tipo)
    .andWhereRaw('LOWER(nombre) LIKE ?', [`%${name.toLowerCase()}%`])
    .first();
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

async function getExpenses(userId, range = {}) {
  let query = Gasto.query()
    .where('user_id', userId)
    .withGraphFetched('categoria')
    .orderBy('fecha', 'desc');

  if (range.startDate && range.endDate) {
    query.whereBetween('fecha', [range.startDate, range.endDate]);
  }

  return query;
}

async function getIncomes(userId, range = {}) {
  let query = Ingreso.query()
    .where('user_id', userId)
    .withGraphFetched('categoria')
    .orderBy('fecha', 'desc');

  if (range.startDate && range.endDate) {
    query.whereBetween('fecha', [range.startDate, range.endDate]);
  }

  return query;
}

export default {
  getChatHistory,
  saveChatMessage,
  getCategories,
  findCategoryByName,
  createExpense,
  createIncome,
  getExpenses,
  getIncomes
};
console.log("SUPABASE_URL:", !!process.env.SUPABASE_URL);
console.log("SUPABASE_SERVICE_ROLE_KEY:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
