import { createClient } from '@supabase/supabase-js';
import db from '../config/db.js';

let supabase = null;

if (
  process.env.SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  supabase = createClient(
    process.env.SUPABASE_URL.trim(),
    process.env.SUPABASE_SERVICE_ROLE_KEY.trim()
  );
} else {
  console.warn('⚠️ Supabase NO inicializado (variables faltantes)');
}

/* ======================
   FUNCIONES (OBLIGATORIO)
====================== */

async function getExpenses(userId) {
  return db('gasto').where('user_id', userId);
}

async function getIncomes(userId) {
  return db('ingreso').where('user_id', userId);
}

async function createExpense(userId, data) {
  return db('gasto').insert({ ...data, user_id: userId });
}

async function createIncome(userId, data) {
  return db('ingreso').insert({ ...data, user_id: userId });
}

async function getCategories() {
  return db('categoria');
}

async function findCategoryByName(name) {
  return db('categoria')
    .whereRaw('LOWER(nombre) = ?', [name.toLowerCase()])
    .first();
}

async function saveChatMessage(userId, role, mensaje) {
  return db('chat_mensaje').insert({ user_id: userId, rol: role, mensaje });
}

async function getChatHistory(userId) {
  return db('chat_mensaje').where('user_id', userId);
}

async function getExpenseSummary(userId) {
  return db('gasto')
    .where('user_id', userId)
    .sum('monto as total');
}

async function getIncomeSummary(userId) {
  return db('ingreso')
    .where('user_id', userId)
    .sum('monto as total');
}

async function getExpensesByCategory(userId) {
  return db('gasto')
    .join('categoria', 'gasto.categoria_id', 'categoria.id_categoria')
    .where('gasto.user_id', userId)
    .groupBy('categoria.nombre')
    .select('categoria.nombre')
    .sum('gasto.monto as total');
}

export default {
  supabase,
  getExpenses,
  getIncomes,
  createExpense,
  createIncome,
  getCategories,
  findCategoryByName,
  saveChatMessage,
  getChatHistory,
  getExpenseSummary,
  getIncomeSummary,
  getExpensesByCategory,
};
