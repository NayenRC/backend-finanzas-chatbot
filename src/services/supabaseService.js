import { createClient } from '@supabase/supabase-js';
import ChatMensaje from '../models/ChatMensaje.js';
import Gasto from '../models/Gasto.js';
import Ingreso from '../models/Ingreso.js';
import Categoria from '../models/Categoria.js';
import Usuario from '../models/Usuario.js';
// Importamos MetaAhorro y MovimientoAhorro por si se usan en el futuro o para consultas completas
// import MetaAhorro from '../models/MetaAhorro.js';
// import MovimientoAhorro from '../models/MovimientoAhorro.js';

let supabase = null;

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(
    process.env.SUPABASE_URL.trim(),
    process.env.SUPABASE_SERVICE_ROLE_KEY.trim()
  );
} else {
  console.warn('⚠️ Supabase NO inicializado (variables faltantes)');
}

/* ==================================================
   MÉTODOS DE DATOS (Usando Objection.js / Knex)
   Estos métodos son los que usa el aiChatCommand.js
================================================== */

/**
 * Obtener historial de chat reciente
 */
async function getChatHistory(userId, limit = 6) {
  try {
    const history = await ChatMensaje.query()
      .where('user_id', userId)
      .orderBy('creado_en', 'desc')
      .limit(limit);

    // Retornamos en orden cronológico (el más antiguo primero) para la IA
    return history.reverse();
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
}

/**
 * Guardar mensaje de chat
 */
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

/**
 * Obtener categorías por tipo (GASTO o INGRESO)
 */
async function getCategories(tipo) {
  try {
    return await Categoria.query()
      .where('tipo', tipo);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Buscar categoría por nombre (aproximado)
 */
async function findCategoryByName(name, tipo) {
  try {
    if (!name) return null;

    // Búsqueda simple insensible a mayúsculas
    const category = await Categoria.query()
      .where('tipo', tipo)
      .andWhereRaw('LOWER(nombre) LIKE ?', [`%${name.toLowerCase()}%`])
      .first();

    return category;
  } catch (error) {
    console.error('Error finding category:', error);
    return null;
  }
}

/**
 * Crear Gasto
 */
async function createExpense(userId, data) {
  return await Gasto.query().insert({
    user_id: userId,
    monto: data.monto,
    descripcion: data.descripcion,
    categoria_id: data.categoria_id,
    fecha: data.fecha || new Date()
  });
}

/**
 * Crear Ingreso
 */
async function createIncome(userId, data) {
  return await Ingreso.query().insert({
    user_id: userId,
    monto: data.monto,
    descripcion: data.descripcion,
    categoria_id: data.categoria_id, // Ingresos table has categoria_id confirmed by check_tables
    fecha: data.fecha || new Date()
  });
}

/**
 * Obtener Gastos (con rango de fechas opcional)
 */
async function getExpenses(userId, range = {}) {
  let query = Gasto.query()
    .where('user_id', userId)
    .withGraphFetched('categoria')
    .orderBy('fecha', 'desc');

  if (range.startDate && range.endDate) {
    query = query.whereBetween('fecha', [range.startDate, range.endDate]);
  }

  return await query;
}

/**
 * Obtener Ingresos (con rango de fechas opcional)
 */
async function getIncomes(userId, range = {}) {
  let query = Ingreso.query()
    .where('user_id', userId)
    .withGraphFetched('categoria')
    .orderBy('fecha', 'desc');

  if (range.startDate && range.endDate) {
    query = query.whereBetween('fecha', [range.startDate, range.endDate]);
  }

  return await query;
}

/**
 * Resumen de Gastos (Total)
 */
async function getExpenseSummary(userId, range = {}) {
  let query = Gasto.query()
    .where('user_id', userId)
    .sum('monto as total_monto')
    .first();

  if (range.startDate && range.endDate) {
    query = query.whereBetween('fecha', [range.startDate, range.endDate]);
  }

  const result = await query;
  return result || { total_monto: 0 };
}

/**
 * Resumen de Ingresos (Total)
 */
async function getIncomeSummary(userId, range = {}) {
  let query = Ingreso.query()
    .where('user_id', userId)
    .sum('monto as total_monto')
    .first();

  if (range.startDate && range.endDate) {
    query = query.whereBetween('fecha', [range.startDate, range.endDate]);
  }

  const result = await query;
  return result || { total_monto: 0 };
}

/**
 * Gastos por Categoría
 */
async function getExpensesByCategory(userId, range = {}) {
  let query = Gasto.query()
    .select('categoria.nombre as categoria_nombre')
    .sum('gastos.monto as total')
    .joinRelated('categoria')
    .where('gastos.user_id', userId)
    .groupBy('categoria.nombre')
    .orderBy('total', 'desc');

  if (range.startDate && range.endDate) {
    query = query.whereBetween('gastos.fecha', [range.startDate, range.endDate]);
  }

  return await query;
}

// Exportamos el cliente supabase original y todos los métodos helper
export default {
  supabase,
  getChatHistory,
  saveChatMessage,
  getCategories,
  findCategoryByName,
  createExpense,
  createIncome,
  getExpenses,
  getIncomes,
  getExpenseSummary,
  getIncomeSummary,
  getExpensesByCategory
};
