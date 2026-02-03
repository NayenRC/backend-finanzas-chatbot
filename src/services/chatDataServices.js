import ChatMensaje from '../models/ChatMensaje.js';
import Gasto from '../models/Gasto.js';
import Ingreso from '../models/Ingreso.js';
import Categoria from '../models/Categoria.js';

/* ==================================================
   DATA ACCESS LAYER
   (Objection.js / Knex)
   👉 SOLO acceso a datos, NADA de lógica
================================================== */

/**
 * Obtener historial de chat del usuario
 */
async function getChatHistory(userId, limit = 10) {
  try {
    const history = await ChatMensaje.query()
      .where('user_id', userId)
      .orderBy('creado_en', 'desc')
      .limit(limit);

    // Importante: la IA necesita orden cronológico
    return history.reverse();
  } catch (error) {
    console.error('❌ Error fetching chat history:', error);
    return [];
  }
}

/**
 * Guardar mensaje de chat (user o assistant)
 */
async function saveChatMessage(userId, rol, mensaje) {
  try {
    await ChatMensaje.query().insert({
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
  try {
    return await Gasto.query().insert({
      user_id: userId,
      monto: data.monto,
      descripcion: data.descripcion || 'Gasto registrado por chatbot',
      categoria_id: data.categoria_id || null,
      fecha: data.fecha || new Date(),
    });
  } catch (error) {
    console.error('❌ Error creating expense:', error);
    throw error;
  }
}

/**
 * Crear ingreso
 */
async function createIncome(userId, data) {
  try {
    return await Ingreso.query().insert({
      user_id: userId,
      monto: data.monto,
      descripcion: data.descripcion || 'Ingreso registrado por chatbot',
      categoria_id: data.categoria_id || null,
      fecha: data.fecha || new Date(),
    });
  } catch (error) {
    console.error('❌ Error creating income:', error);
    throw error;
  }
}

/**
 * Obtener resumen de ingresos en un rango de fechas
 */
async function getIncomeSummary(userId, range) {
  try {
    const query = Ingreso.query().where('user_id', userId);
    if (range?.startDate) query.where('fecha', '>=', range.startDate);
    if (range?.endDate) query.where('fecha', '<=', range.endDate);

    const result = await query.sum('monto as total_monto').first();
    return result || { total_monto: 0 };
  } catch (error) {
    console.error('❌ Error getting income summary:', error);
    return { total_monto: 0 };
  }
}

/**
 * Obtener resumen de gastos en un rango de fechas
 */
async function getExpenseSummary(userId, range) {
  try {
    const query = Gasto.query().where('user_id', userId);
    if (range?.startDate) query.where('fecha', '>=', range.startDate);
    if (range?.endDate) query.where('fecha', '<=', range.endDate);

    const result = await query.sum('monto as total_monto').first();
    return result || { total_monto: 0 };
  } catch (error) {
    console.error('❌ Error getting expense summary:', error);
    return { total_monto: 0 };
  }
}

/**
 * Obtener ingresos detallados
 */
async function getIncomes(userId, range) {
  try {
    const query = Ingreso.query().where('user_id', userId).orderBy('fecha', 'desc');
    if (range?.startDate) query.where('fecha', '>=', range.startDate);
    if (range?.endDate) query.where('fecha', '<=', range.endDate);
    if (range?.limit) query.limit(range.limit);

    return await query;
  } catch (error) {
    console.error('❌ Error getting incomes:', error);
    return [];
  }
}

/**
 * Obtener gastos detallados
 */
async function getExpenses(userId, range) {
  try {
    const query = Gasto.query().where('user_id', userId).orderBy('fecha', 'desc');
    if (range?.startDate) query.where('fecha', '>=', range.startDate);
    if (range?.endDate) query.where('fecha', '<=', range.endDate);
    if (range?.limit) query.limit(range.limit);

    return await query;
  } catch (error) {
    console.error('❌ Error getting expenses:', error);
    return [];
  }
}

/**
 * Obtener gastos agrupados por categoría
 */
async function getExpensesByCategory(userId, range) {
  try {
    const query = Gasto.query()
      .select('categoria.nombre as categoria')
      .sum('monto as total')
      .joinRelated('categoria')
      .where('gasto.user_id', userId)
      .groupBy('categoria.nombre');

    if (range?.startDate) query.where('fecha', '>=', range.startDate);
    if (range?.endDate) query.where('fecha', '<=', range.endDate);

    return await query;
  } catch (error) {
    console.error('❌ Error getting expenses by category:', error);
    return [];
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
};
