import db from '../config/db.js';
import Gasto from '../models/Gasto.js';
import Ingreso from '../models/Ingreso.js';
import Categoria from '../models/Categoria.js';

/* ==================================================
   DATA ACCESS LAYER
   👉 SOLO acceso a datos, NADA de lógica
================================================== */

/**
 * Obtener historial de chat del usuario
 */
async function getChatHistory(userId, limit = 10) {
  try {
    return await db('chat_mensaje')
      .where('user_id', userId)
      .orderBy('creado_en', 'desc')
      .limit(limit);
  } catch (error) {
    console.error('❌ Error getting chat history:', error);
    return [];
  }
}

/**
 * Guardar mensaje de chat (user o assistant)
 */
async function saveChatMessage(userId, rol, mensaje) {
  try {
    await db('chat_mensaje').insert({
      user_id: userId,
      rol,
      mensaje,
      creado_en: new Date(),
    });
  } catch (error) {
    console.error('❌ Error saving chat message:', error);
  }
}

/**
 * Obtener categorías por tipo (GASTO / INGRESO)
 */
async function getCategories(tipo) {
  try {
    return await Categoria.query()
      .where('tipo', tipo)
      .orderBy('nombre', 'asc');
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    return [];
  }
}

/**
 * Crear gasto
 */
async function createExpense(userId, data) {
  return await Gasto.query().insert({
    user_id: userId,
    monto: data.monto,
    descripcion: data.descripcion || 'Gasto registrado por chatbot',
    categoria_id: data.categoria_id || null,
    fecha: data.fecha || new Date(),
  });
}

/**
 * Crear ingreso
 */
async function createIncome(userId, data) {
  return await Ingreso.query().insert({
    user_id: userId,
    monto: data.monto,
    descripcion: data.descripcion || 'Ingreso registrado por chatbot',
    categoria_id: data.categoria_id || null,
    fecha: data.fecha || new Date(),
  });
}

/**
 * Resumen de ingresos
 */
async function getIncomeSummary(userId, range) {
  const query = Ingreso.query().where('user_id', userId);
  if (range?.startDate) query.where('fecha', '>=', range.startDate);
  if (range?.endDate) query.where('fecha', '<=', range.endDate);

  const result = await query.sum('monto as total_monto').first();
  return result || { total_monto: 0 };
}

/**
 * Resumen de gastos
 */
async function getExpenseSummary(userId, range) {
  const query = Gasto.query().where('user_id', userId);
  if (range?.startDate) query.where('fecha', '>=', range.startDate);
  if (range?.endDate) query.where('fecha', '<=', range.endDate);

  const result = await query.sum('monto as total_monto').first();
  return result || { total_monto: 0 };
}

/**
 * Ingresos detallados
 */
async function getIncomes(userId, range) {
  const query = Ingreso.query()
    .where('user_id', userId)
    .orderBy('fecha', 'desc');

  if (range?.startDate) query.where('fecha', '>=', range.startDate);
  if (range?.endDate) query.where('fecha', '<=', range.endDate);
  if (range?.limit) query.limit(range.limit);

  return await query;
}

/**
 * Gastos detallados
 */
async function getExpenses(userId, range) {
  const query = Gasto.query()
    .where('user_id', userId)
    .orderBy('fecha', 'desc');

  if (range?.startDate) query.where('fecha', '>=', range.startDate);
  if (range?.endDate) query.where('fecha', '<=', range.endDate);
  if (range?.limit) query.limit(range.limit);

  return await query;
}

/**
 * Gastos por categoría
 */
async function getExpensesByCategory(userId, range) {
  const query = Gasto.query()
    .select('categoria.nombre as categoria')
    .sum('monto as total')
    .joinRelated('categoria')
    .where('gastos.user_id', userId)
    .groupBy('categoria.nombre');

  if (range?.startDate) query.where('gastos.fecha', '>=', range.startDate);
  if (range?.endDate) query.where('gastos.fecha', '<=', range.endDate);

  return await query;
}
/**
 * Obtener usuario por telegram_id
 */
async function getUserByTelegramId(telegramId) {
  try {
    const user = await db('users')
      .where('telegram_id', telegramId)
      .first();

    return user || null;
  } catch (error) {
    console.error('❌ Error obteniendo usuario por telegram:', error);
    return null;
  }
}


/* ==================================================
   EXPORT
================================================== */
export default {
  getChatHistory,
  saveChatMessage,
  getCategories,
  createExpense,
  createIncome,
  getIncomeSummary,
  getExpenseSummary,
  getIncomes,
  getExpenses,
  getExpensesByCategory,
  getUserByTelegramId, 
};
