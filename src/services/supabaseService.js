/**
 * Supabase Service
 * 
 * Wrapper service for Supabase operations to interact with the database
 * using the Supabase SDK alongside existing Knex models.
 */

import { createClient } from '@supabase/supabase-js';
import db from '../config/db.js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://bluazcviihdrhqgkmohg.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!supabaseKey) {
    console.warn('⚠️ SUPABASE_ANON_KEY not configured. Some features may not work.');
}

const supabase = supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * Get expenses for a user with optional filters
 */
async function getExpenses(userId, filters = {}) {
    const { startDate, endDate, categoria, limit = 100 } = filters;

    let query = db('gasto')
        .where('user_id', userId)
        .orderBy('fecha', 'desc')
        .limit(limit);

    if (startDate) {
        query = query.where('fecha', '>=', startDate);
    }

    if (endDate) {
        query = query.where('fecha', '<=', endDate);
    }

    if (categoria) {
        query = query.where('categoria_id', categoria);
    }

    return await query;
}

/**
 * Get incomes for a user with optional filters
 */
async function getIncomes(userId, filters = {}) {
    const { startDate, endDate, categoria, limit = 100 } = filters;

    let query = db('ingreso')
        .where('user_id', userId)
        .orderBy('fecha', 'desc')
        .limit(limit);

    if (startDate) {
        query = query.where('fecha', '>=', startDate);
    }

    if (endDate) {
        query = query.where('fecha', '<=', endDate);
    }

    if (categoria) {
        query = query.where('categoria_id', categoria);
    }

    return await query;
}

/**
 * Create a new expense
 */
async function createExpense(userId, expenseData) {
    const { monto, descripcion, categoria_id, fecha } = expenseData;

    const [expense] = await db('gasto')
        .insert({
            user_id: userId,
            monto,
            descripcion,
            categoria_id,
            fecha: fecha || new Date().toISOString().split('T')[0],
        })
        .returning('*');

    return expense;
}

/**
 * Create a new income
 */
async function createIncome(userId, incomeData) {
    const { monto, descripcion, categoria_id, fecha } = incomeData;

    const [income] = await db('ingreso')
        .insert({
            user_id: userId,
            monto,
            descripcion,
            categoria_id,
            fecha: fecha || new Date().toISOString().split('T')[0],
        })
        .returning('*');

    return income;
}

/**
 * Get categories by type (GASTO, INGRESO, AHORRO)
 */
async function getCategories(type = null) {
    let query = db('categoria');

    if (type) {
        query = query.where('tipo', type);
    }

    return await query;
}

/**
 * Find category by name (case-insensitive)
 */
async function findCategoryByName(name, type = 'GASTO') {
    const categories = await db('categoria')
        .where('tipo', type)
        .whereRaw('LOWER(nombre) = ?', [name.toLowerCase()]);

    return categories[0] || null;
}

/**
 * Save a chat message to the database
 */
async function saveChatMessage(userId, role, mensaje, tipo = 'TEXTO') {
    const [chatMessage] = await db('chat_mensaje')
        .insert({
            user_id: userId,
            rol: role, // 'USUARIO' or 'BOT'
            tipo, // 'TEXTO', 'CONSEJO', 'ALERTA', 'RESUMEN'
            mensaje,
        })
        .returning('*');

    return chatMessage;
}

/**
 * Get chat history for a user
 */
async function getChatHistory(userId, limit = 10) {
    return await db('chat_mensaje')
        .where('user_id', userId)
        .orderBy('creado_en', 'desc')
        .limit(limit)
        .then(messages => messages.reverse()); // Return in chronological order
}

/**
 * Get expense summary/statistics for a user
 */
async function getExpenseSummary(userId, filters = {}) {
    const { startDate, endDate } = filters;

    let query = db('gasto')
        .where('user_id', userId)
        .select(
            db.raw('COUNT(*) as total_gastos'),
            db.raw('SUM(monto) as total_monto')
        );

    if (startDate) {
        query = query.where('fecha', '>=', startDate);
    }

    if (endDate) {
        query = query.where('fecha', '<=', endDate);
    }

    const [summary] = await query;
    return summary;
}

/**
 * Get income summary/statistics for a user
 */
async function getIncomeSummary(userId, filters = {}) {
    const { startDate, endDate } = filters;

    let query = db('ingreso')
        .where('user_id', userId)
        .select(
            db.raw('COUNT(*) as total_ingresos'),
            db.raw('SUM(monto) as total_monto')
        );

    if (startDate) {
        query = query.where('fecha', '>=', startDate);
    }

    if (endDate) {
        query = query.where('fecha', '<=', endDate);
    }

    const [summary] = await query;
    return summary;
}

/**
 * Get expenses grouped by category
 */
async function getExpensesByCategory(userId, filters = {}) {
    const { startDate, endDate } = filters;

    let query = db('gasto')
        .join('categoria', 'gasto.categoria_id', 'categoria.id_categoria')
        .where('gasto.user_id', userId)
        .select(
            'categoria.nombre as categoria',
            db.raw('COUNT(*) as cantidad'),
            db.raw('SUM(gasto.monto) as total')
        )
        .groupBy('categoria.id_categoria', 'categoria.nombre');

    if (startDate) {
        query = query.where('gasto.fecha', '>=', startDate);
    }

    if (endDate) {
        query = query.where('gasto.fecha', '<=', endDate);
    }

    return await query;
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