/**
 * Telegram Controller
 * 
 * Controlador para manejar la lógica de negocio de las rutas de Telegram.
 */

import TelegramBot from 'node-telegram-bot-api';
import Usuario from '../models/Usuario.js';
import jwt from 'jsonwebtoken';
import chatBotFinanceService from '../services/chatBotFinanceService.js';
import supabaseService from '../services/supabaseService.js';

// SECRET para JWT (debería ir en .env)
const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro';

/**
 * Login / Registro desde Telegram
 * 
 * Recibe: telegram_id, personal_info
 * Retorna: Token JWT, user data
 */
const login = async (req, res) => {
  try {
    const { telegram_id, username, nombre } = req.body;

    if (!telegram_id) {
      return res.status(400).json({ error: 'telegram_id requerido' });
    }

    // 1. Buscar si el usuario ya existe por telegram_id
    let usuario = await Usuario.query().findOne({ telegram_id });

    // 2. Si no existe, crearlo
    if (!usuario) {
      console.log('✨ Creando nuevo usuario desde Telegram:', telegram_id);

      // Intentamos generar un email dummy si no hay info, o dejarlo null si tu schema lo permite
      // En tu schema email es UNIQUE, asi que mejor usaremos null si es permitido o un fake único

      usuario = await Usuario.query().insert({
        telegram_id: telegram_id, // Corregido para coincidir con la búsqueda y AuthController
        nombre: nombre || username || 'Usuario Telegram',
        activo: true
      });
    }

    // 3. Generar Token JWT
    const token = jwt.sign(
      {
        id: usuario.user_id, // ✅ CORREGIDO: Usamos 'id' para ser compatible con AuthController y middlewares
        user_id: usuario.user_id, // ➕ AGREGADO: Para compatibilidad con controladores que busquen user_id
        telegram_id: usuario.telegram_id
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      message: 'Login exitoso',
      token,
      user: usuario
    });

  } catch (error) {
    console.error('❌ Error en Telegram Login:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Handle AI Chat
 * 
 * Recibe: mensaje
 * Retorna: respuesta IA
 */
const chat = async (req, res) => {
  try {
    // El usuario viene del middleware de auth (req.user)
    const user_id = req.user.id || req.user.user_id; // ✅ CORREGIDO: Leemos 'id' o 'user_id'
    const { mensaje } = req.body;

    if (!mensaje) {
      return res.status(400).json({ error: 'Mensaje requerido' });
    }

    // Procesar mensaje con AI Command
    const result = await chatBotFinanceService.processMessage(user_id, mensaje);

    return res.json(result);

  } catch (error) {
    console.error('❌ Error en AI Chat:', error);
    return res.status(500).json({ error: 'Error procesando mensaje' });
  }
};

/**
 * Get Balance Summary
 * Retorna el resumen financiero del mes actual
 */
const getBalance = async (req, res) => {
  try {
    const user_id = req.user.id || req.user.user_id; // ✅ CORREGIDO: Leemos 'id' o 'user_id'

    console.log(' GET BALANCE - User ID:', user_id);

    // 1. Obtenemos totales HISTÓRICOS (sin filtro de fecha)
    const expenseSummary = await supabaseService.getExpenseSummary(user_id);
    const incomeSummary = await supabaseService.getIncomeSummary(user_id);

    // 2. Obtenemos los últimos 10 movimientos para la lista
    const expensesList = await supabaseService.getExpenses(user_id, { limit: 10 });
    const incomesList = await supabaseService.getIncomes(user_id, { limit: 10 });

    console.log('📉 Resumen Gastos DB:', expenseSummary);
    console.log('📈 Resumen Ingresos DB:', incomeSummary);
    console.log('� Cantidad Gastos encontrados:', expensesList.length);
    console.log('📋 Cantidad Ingresos encontrados:', incomesList.length);

    const totalIngresos = Number(incomeSummary?.total_monto || 0);
    const totalGastos = Number(expenseSummary?.total_monto || 0);
    const balance = totalIngresos - totalGastos;

    // --- GENERACIÓN DE GRÁFICO ---
    // Calculamos disponible (si es negativo, es 0 para el gráfico)
    const disponible = balance > 0 ? balance : 0;

    const chartConfig = {
      type: 'pie',
      data: {
        labels: ['Gastos', 'Disponible'],
        datasets: [{
          data: [totalGastos, disponible],
          backgroundColor: ['#FF6384', '#36A2EB'], // Rojo y Azul
        }]
      },
      options: { plugins: { title: { display: true, text: 'Disponibilidad' } } }
    };
    const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}`;

    return res.json({
      periodo: 'Total Histórico',
      ingresos: totalIngresos,
      gastos: totalGastos,
      balance: balance,
      grafico_url: chartUrl,
      lista_ingresos: incomesList,
      lista_gastos: expensesList
    });

  } catch (error) {
    console.error('❌ Error obteniendo balance:', error);
    return res.status(500).json({ error: 'Error al obtener balance' });
  }
};

/**
 * Registrar Gasto (Desde Bot)
 */
const registerExpense = async (req, res) => {
  try {
    const user_id = req.user.id || req.user.user_id;
    const { monto, descripcion, fecha } = req.body;

    console.log('📝 Telegram: Registrando Gasto para:', user_id);

    // Obtener categoría por defecto (para evitar error de FK)
    const categories = await supabaseService.getCategories('GASTO');
    const defaultCat = categories.find(c => c.nombre.toLowerCase().includes('otro')) || categories[0];

    const result = await supabaseService.createExpense(user_id, {
      monto,
      descripcion,
      fecha,
      categoria_id: defaultCat?.id_categoria
    });

    return res.json(result);
  } catch (error) {
    console.error('❌ Error registrando gasto:', error);
    return res.status(500).json({ error: 'Error al registrar gasto' });
  }
};

/**
 * Registrar Ingreso (Desde Bot)
 */
const registerIncome = async (req, res) => {
  try {
    const user_id = req.user.id || req.user.user_id;
    const { monto, descripcion, fecha } = req.body;

    console.log('📝 Telegram: Registrando Ingreso para:', user_id);

    const categories = await supabaseService.getCategories('INGRESO');
    const defaultCat = categories.find(c => c.nombre.toLowerCase().includes('otro')) || categories[0];

    const result = await supabaseService.createIncome(user_id, {
      monto,
      descripcion,
      fecha,
      categoria_id: defaultCat?.id_categoria
    });

    return res.json(result);
  } catch (error) {
    console.error('❌ Error registrando ingreso:', error);
    return res.status(500).json({ error: 'Error al registrar ingreso' });
  }
};

export default {
  login,
  chat,
  getBalance,
  registerExpense,
  registerIncome
};