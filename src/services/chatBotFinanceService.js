// services/ChatbotFinanceService.js (antes aiChatCommand)

import openRouterService from '../services/openRouterService.js';
import ChatMensaje from '../models/ChatMensaje.js';
import Ingreso from '../models/Ingreso.js';
import Categoria from '../models/Categoria.js';
import Gasto from '../models/Gasto.js';
import openRouterService from '../services/openRouterService.js';

async function processMessage(userId, userMessage) {
  try {
    /* ===============================
        Obtener historial de chat
    =============================== */
    const chatHistory = await ChatMensaje.findByUser(userId);

    const formattedHistory = chatHistory
      .slice(-6)
      .map(msg => ({
        role: msg.es_bot ? 'assistant' : 'user',
        content: msg.mensaje
      }));

    /* ===============================
       Guardar mensaje del usuario
    =============================== */
    await ChatMensaje.create({
      user_id: userId,
      mensaje: userMessage,
      es_bot: false
    });

    /* ===============================
      Detectar intención con IA
    =============================== */
    const { intencion, confianza } =
      await openRouterService.analyzeIntent(userMessage);

    console.log(`🤖 Intención: ${intencion} (${confianza})`);

    let response;

    /* ===============================
       Ruteo por intención
    =============================== */
    switch (intencion) {
      case 'REGISTRAR_GASTO':
        response = await handleExpenseRecording(
          userId,
          userMessage
        );
        break;

      case 'REGISTRAR_INGRESO':
        response = await handleIncomeRecording(
          userId,
          userMessage
        );
        break;

      case 'CONSULTAR':
        response = await handleQuery(
          userId,
          userMessage,
          formattedHistory
        );
        break;

      default:
        response =
          await openRouterService.generateGeneralResponse(
            userMessage,
            formattedHistory
          );
    }

    /* ===============================
       Guardar respuesta del bot
    =============================== */
    await ChatMensaje.create({
      user_id: userId,
      mensaje: response,
      es_bot: true
    });

    return {
      success: true,
      response,
      intent: intencion
    };

  } catch (error) {
    console.error('❌ Error en ChatbotFinanceService:', error);

    const fallback =
      'Lo siento, tuve un problema al procesar tu mensaje 😕';

    await ChatMensaje.create({
      user_id: userId,
      mensaje: fallback,
      es_bot: true
    });

    return {
      success: false,
      response: fallback,
      error: error.message
    };
  }
}


async function handleExpenseRecording(userId, userMessage) {
  try {
    console.log(`📝 Registrando gasto usuario ${userId}: "${userMessage}"`);

    /* ===============================
        Obtener categorías del usuario
    =============================== */
    const categorias = await Categoria.findByUser(userId);

    /* ===============================
      IA extrae datos del gasto
    =============================== */
    const expenseData =
      await openRouterService.classifyExpense(
        userMessage,
        categorias
      );

    /* ===============================
        Manejo de errores IA
    =============================== */
    if (expenseData?.error) {
      return expenseData.sugerencia ||
        'Para registrar un gasto necesito el monto y una descripción 💸';
    }

    if (
      expenseData.info_faltante &&
      expenseData.info_faltante.includes('monto')
    ) {
      return `Entiendo el gasto en **${expenseData.descripcion || 'algo'}**, pero me falta el monto 💰 ¿Cuánto fue?`;
    }

    if (!expenseData.monto || isNaN(expenseData.monto)) {
      return 'No pude entender el monto del gasto 🤔 ¿Me lo puedes decir de nuevo?';
    }

    /* ===============================
       Resolver categoría
    =============================== */
    let categoria = null;

    if (expenseData.categoria) {
      categoria = categorias.find(c =>
        c.nombre.toLowerCase()
          .includes(expenseData.categoria.toLowerCase())
      );
    }

    if (!categoria && categorias.length > 0) {
      categoria =
        categorias.find(c =>
          c.nombre.toLowerCase().includes('otro')
        ) || categorias[0];
    }

    /* ===============================
      Guardar gasto
    =============================== */
    await Gasto.create({
      user_id: userId,
      monto: expenseData.monto,
      descripcion: expenseData.descripcion || 'Gasto registrado por chatbot',
      categoria_id: categoria?.id_categoria || null,
      fecha: new Date().toISOString().split('T')[0]
    });

    /* ===============================
      Respuesta al usuario
    =============================== */
    return `¡Listo! ✨ Registré tu gasto:

💸 **Monto**: $${expenseData.monto.toLocaleString('es-CL')}
📝 **Descripción**: ${expenseData.descripcion || 'Sin descripción'}
🏷️ **Categoría**: ${categoria?.nombre || 'General'}

¿Quieres agregar otro gasto o revisar un resumen? 😊`;

  } catch (error) {
    console.error('❌ Error en handleExpenseRecording:', error);
    return 'Tuve un problema técnico al guardar el gasto 😕 ¿Lo intentamos de nuevo?';
  }
}

async function handleIncomeRecording(userId, userMessage) {
  try {
    console.log(`📝 Registrando ingreso usuario ${userId}: "${userMessage}"`);

    /* ===============================
        Obtener categorías del usuario
    =============================== */
    const categorias = await Categoria.findByUser(userId);

    /* ===============================
       IA extrae datos del ingreso
    =============================== */
    const incomeData =
      await openRouterService.classifyIncome(
        userMessage,
        categorias
      );

    /* ===============================
        Manejo de errores IA
    =============================== */
    if (incomeData?.error) {
      return incomeData.sugerencia ||
        'Para registrar un ingreso necesito el monto y una descripción 💰';
    }

    if (
      incomeData.info_faltante &&
      incomeData.info_faltante.includes('monto')
    ) {
      return `Qué buena noticia 🎉 Entiendo el ingreso por **${incomeData.descripcion || 'algo'}**, pero me falta el monto 💰 ¿Cuánto fue?`;
    }

    if (!incomeData.monto || isNaN(incomeData.monto)) {
      return 'No pude entender el monto del ingreso 🤔 ¿Me lo puedes decir de nuevo?';
    }

    /* ===============================
       Resolver categoría
    =============================== */
    let categoria = null;

    if (incomeData.categoria) {
      categoria = categorias.find(c =>
        c.nombre.toLowerCase()
          .includes(incomeData.categoria.toLowerCase())
      );
    }

    if (!categoria && categorias.length > 0) {
      categoria =
        categorias.find(c =>
          c.nombre.toLowerCase().includes('otro')
        ) || categorias[0];
    }

    /* ===============================
       Guardar ingreso
    =============================== */
    await Ingreso.create({
      user_id: userId,
      monto: incomeData.monto,
      descripcion: incomeData.descripcion || 'Ingreso registrado por chatbot',
      categoria_id: categoria?.id_categoria || null,
      fecha: new Date().toISOString().split('T')[0]
    });

    /* ===============================
       Respuesta al usuario
    =============================== */
    return `¡Excelente! 🌟 Registré tu ingreso:

💰 **Monto**: $${incomeData.monto.toLocaleString('es-CL')}
📝 **Descripción**: ${incomeData.descripcion || 'Sin descripción'}
🏷️ **Categoría**: ${categoria?.nombre || 'General'}

¿Quieres registrar otro ingreso o revisar cómo va tu balance? 😊`;

  } catch (error) {
    console.error('❌ Error en handleIncomeRecording:', error);
    return 'Tuve un problema técnico al guardar el ingreso 😕 ¿Lo intentamos de nuevo?';
  }
}

import Gasto from '../models/Gasto.js';
import Ingreso from '../models/Ingreso.js';
import Categoria from '../models/Categoria.js';
import openRouterService from '../services/openRouterService.js';

async function handleQuery(userId, userMessage, chatHistory) {
  try {
    /* ===============================
       Determinar rango de fechas
    =============================== */
    const timeRange = extractTimeRange(userMessage);

    /* ===============================
       Obtener datos base
    =============================== */
    let gastos = await Gasto.findByUser(userId);
    let ingresos = await Ingreso.findByUser(userId);

    /* ===============================
        Filtrar por fechas (si aplica)
    =============================== */
    if (timeRange.startDate && timeRange.endDate) {
      gastos = gastos.filter(g =>
        g.fecha >= timeRange.startDate &&
        g.fecha <= timeRange.endDate
      );

      ingresos = ingresos.filter(i =>
        i.fecha >= timeRange.startDate &&
        i.fecha <= timeRange.endDate
      );
    }

    /* ===============================
       Calcular totales
    =============================== */
    const totalGastos = gastos.reduce(
      (sum, g) => sum + Number(g.monto || 0), 0
    );

    const totalIngresos = ingresos.reduce(
      (sum, i) => sum + Number(i.monto || 0), 0
    );

    const balance = totalIngresos - totalGastos;

    /* ===============================
       Agrupar gastos por categoría
    =============================== */
    const categorias = await Categoria.findByUser(userId);

    const gastosPorCategoria = categorias.map(cat => {
      const total = gastos
        .filter(g => g.categoria_id === cat.id_categoria)
        .reduce((sum, g) => sum + Number(g.monto || 0), 0);

      return {
        categoria: cat.nombre,
        total
      };
    }).filter(c => c.total > 0);

    /* ===============================
       Preparar payload para IA
    =============================== */
    const financialData = {
      periodo: timeRange.label || 'todos los registros',
      resumen: {
        total_gastos: totalGastos,
        total_ingresos: totalIngresos,
        balance,
        estado: balance >= 0 ? 'A favor 🟢' : 'En contra 🔴'
      },
      ultimos_gastos: gastos.slice(0, 5),
      ultimos_ingresos: ingresos.slice(0, 5),
      gastos_por_categoria: gastosPorCategoria
    };

    /* ==============================
       Respuesta natural con IA
    =============================== */
    const response =
      await openRouterService.generateQueryResponse(
        userMessage,
        financialData,
        chatHistory
      );

    return response;

  } catch (error) {
    console.error('❌ Error en handleQuery:', error);
    return 'Tuve un problema al consultar tus datos financieros 😕';
  }
}

export default {
  processMessage
};
