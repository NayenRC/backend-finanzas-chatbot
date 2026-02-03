import openRouterService from './openRouterService.js';
import chatDataService from './chatDataServices.js';

/**
 * ==================================================
 * CHATBOT FINANCE SERVICE
 * - NLP / IA
 * - Ruteo por intención
 * - Orquesta servicios
 * ==================================================
 */

async function processMessage(userId, userMessage) {
  try {
    /* ===============================
       Validación básica
    =============================== */
    if (!userMessage || userMessage.trim().length < 2) {
      return {
        success: true,
        response: 'Hola 👋 ¿En qué te puedo ayudar?',
        intent: 'SALUDO',
      };
    }

    /* ===============================
       Historial de chat
    =============================== */
    const chatHistory = await chatDataService.getChatHistory(userId, 6);

    const formattedHistory = chatHistory.map(msg => ({
      role: msg.rol,
      content: msg.mensaje,
    }));

    /* ===============================
       Guardar mensaje usuario
    =============================== */
    await chatDataService.saveChatMessage(
      userId,
      'user',
      userMessage
    );

    /* ===============================
       Detectar intención (IA)
    =============================== */
    let intent = 'OTRO';

    try {
      const result = await openRouterService.analyzeIntent(userMessage);
      intent = result?.intencion || 'OTRO';
    } catch (err) {
      console.warn('⚠️ IA no disponible, usando fallback');
    }

    let response;

    /* ===============================
       RUTEO POR INTENCIÓN
    =============================== */
    switch (intent) {
      case 'REGISTRAR_GASTO':
        response = await handleExpense(userId, userMessage);
        break;

      case 'REGISTRAR_INGRESO':
        response = await handleIncome(userId, userMessage);
        break;

      case 'CONSULTAR':
        response = await handleQuery(userMessage, formattedHistory);
        break;

      default:
        response = await openRouterService.generateGeneralResponse(
          userMessage,
          formattedHistory
        );
    }

    /* ===============================
       Guardar respuesta bot
    =============================== */
    await chatDataService.saveChatMessage(
      userId,
      'assistant',
      response
    );

    return {
      success: true,
      response,
      intent,
    };

  } catch (error) {
    console.error('❌ Chatbot error:', error);

    return {
      success: false,
      response:
        'Hola 👋 Tuve un problema interno, pero sigo activo 😊',
      error: error.message,
    };
  }
}

/* ==================================================
   HANDLERS
================================================== */

/**
 * Registrar gasto
 */
async function handleExpense(userId, message) {
  try {
    const categorias = await chatDataService.getCategories('GASTO');

    const expenseData =
      await openRouterService.classifyExpense(
        message,
        categorias
      );

    if (expenseData?.error) {
      return (
        expenseData.sugerencia ||
        'Para registrar un gasto dime el monto y una descripción 💸'
      );
    }

    if (!expenseData.monto || isNaN(expenseData.monto)) {
      return '¿Cuánto fue el monto del gasto? 💰';
    }

    let categoria = null;

    if (expenseData.categoria) {
      categoria = categorias.find(c =>
        c.nombre.toLowerCase().includes(
          expenseData.categoria.toLowerCase()
        )
      );
    }

    await chatDataService.createExpense(userId, {
      monto: expenseData.monto,
      descripcion: expenseData.descripcion,
      categoria_id: categoria?.id_categoria || null,
    });

    return `¡Listo! ✨ He registrado tu gasto:

💸 Monto: $${expenseData.monto.toLocaleString('es-CL')}
📝 Descripción: ${expenseData.descripcion || 'Sin descripción'}
🏷️ Categoría: ${categoria?.nombre || 'General'}

¿Quieres agregar otro gasto? 😊`;

  } catch (error) {
    console.error('❌ Error registrando gasto:', error);
    return 'Tuve un problema al guardar el gasto 😕';
  }
}

/**
 * Registrar ingreso
 */
async function handleIncome(userId, message) {
  try {
    const categorias = await chatDataService.getCategories('INGRESO');

    const incomeData =
      await openRouterService.classifyIncome(
        message,
        categorias
      );

    if (incomeData?.error) {
      return (
        incomeData.sugerencia ||
        'Para registrar un ingreso dime el monto 💰'
      );
    }

    if (!incomeData.monto || isNaN(incomeData.monto)) {
      return '¿Cuánto fue el ingreso? 💰';
    }

    let categoria = null;

    if (incomeData.categoria) {
      categoria = categorias.find(c =>
        c.nombre.toLowerCase().includes(
          incomeData.categoria.toLowerCase()
        )
      );
    }

    await chatDataService.createIncome(userId, {
      monto: incomeData.monto,
      descripcion: incomeData.descripcion,
      categoria_id: categoria?.id_categoria || null,
    });

    return `¡Excelente! 🌟 Ingreso registrado:

💰 Monto: $${incomeData.monto.toLocaleString('es-CL')}
📝 Descripción: ${incomeData.descripcion || 'Ingreso'}
🏷️ Categoría: ${categoria?.nombre || 'General'}

¿Deseas registrar otro ingreso? 😊`;

  } catch (error) {
    console.error('❌ Error registrando ingreso:', error);
    return 'Tuve un problema al guardar el ingreso 😕';
  }
}

/**
 * Consultas generales
 */
async function handleQuery(message, history) {
  try {
    return await openRouterService.generateQueryResponse(
      message,
      {},
      history
    );
  } catch (error) {
    console.error('❌ Error consulta:', error);
    return 'No pude obtener esa información ahora 😕';
  }
}

/* ==================================================
   EXPORT
================================================== */
export default {
  processMessage,
};
