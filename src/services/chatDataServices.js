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

/* ==================================================
   EXPORT
================================================== */
export default {
  getChatHistory,
  saveChatMessage,
  getCategories,
  createExpense,
  createIncome,
};
