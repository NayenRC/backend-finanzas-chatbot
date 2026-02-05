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
        response = await handleQuery(userId,userMessage, formattedHistory);
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
        'Hola 👋 Estoy activo, pero ahora mismo no puedo responder con IA.\n\nPuedes registrar gastos, ingresos o metas sin problema 😊',
      error: error.message,
    };
  }
}

/* ==================================================
   HANDLERS
================================================== */

/**
 * Obtener estado del presupuesto mensual
 */
async function getBudgetStatus(userId) {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysRemaining = endOfMonth.getDate() - today.getDate();

    const range = {
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    };

    const incomeSum = await chatDataService.getIncomeSummary(userId, range);
    const expenseSum = await chatDataService.getExpenseSummary(userId, range);

    const totalIngresos = Number(incomeSum?.total_monto || 0);
    const totalGastos = Number(expenseSum?.total_monto || 0);
    const disponible = totalIngresos - totalGastos;

    if (totalIngresos <= 0) {
      return '\n\n💡 **Tip**: Registra tus ingresos del mes para ver cuánto presupuesto te va quedando.';
    }

    const porcentajeDisponible = Math.round((disponible / totalIngresos) * 100);
    let statusEmoji = '🟢';
    let motivationalMsg = '¡Vas muy bien!';

    if (porcentajeDisponible <= 20) {
      statusEmoji = '🔴';
      motivationalMsg = '¡Cuidado! Queda poco presupuesto';
    } else if (porcentajeDisponible <= 50) {
      statusEmoji = '🟡';
      motivationalMsg = 'Vas bien, pero ojo con los gastos';
    }

    const formatCLP = (amount) =>
      Math.round(amount)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `\n\n📊 **Estado del mes**:
${statusEmoji} Te queda **${porcentajeDisponible}%** disponible ($${formatCLP(disponible)})
📅 Faltan **${daysRemaining} días** para fin de mes
💡 ${motivationalMsg}`;
  } catch (err) {
    console.error('❌ Error calculando presupuesto:', err);
    return '';
  }
}

/**
 * Registrar gasto
 */
async function handleExpense(userId, message) {
  try {
    const categorias = await chatDataService.getCategories('GASTO');

    const expenseData = await openRouterService.classifyExpense(
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
      categoria = categorias.find((c) =>
        c.nombre.toLowerCase().includes(expenseData.categoria.toLowerCase())
      );
    }

    await chatDataService.createExpense(userId, {
      monto: expenseData.monto,
      descripcion: expenseData.descripcion,
      categoria_id: categoria?.id_categoria || null,
    });

    const budgetMsg = await getBudgetStatus(userId);

    return `¡Listo! ✨ He registrado tu gasto:

💸 Monto: $${expenseData.monto.toLocaleString('es-CL')}
📝 Descripción: ${expenseData.descripcion || 'Sin descripción'}
🏷️ Categoría: ${categoria?.nombre || 'General'}${budgetMsg}`;
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

    const incomeData = await openRouterService.classifyIncome(
      message,
      categorias
    );

    if (incomeData?.error) {
      return (
        incomeData.sugerencia || 'Para registrar un ingreso dime el monto 💰'
      );
    }

    if (!incomeData.monto || isNaN(incomeData.monto)) {
      if (
        incomeData.info_faltante &&
        incomeData.info_faltante.includes('monto')
      ) {
        return `¡Genial por ese ingreso! 💰 Pero me falta saber el monto de "**${incomeData.description || 'este ingreso'
          }**". ¿Cuánto fue?`;
      }
      return '¿Cuánto fue el ingreso? 💰';
    }

    let categoria = null;

    if (incomeData.categoria) {
      categoria = categorias.find((c) =>
        c.nombre.toLowerCase().includes(incomeData.categoria.toLowerCase())
      );
    }

    if (!categoria && categorias.length > 0) {
      categoria =
        categorias.find((c) => c.nombre.toLowerCase().includes('otro')) ||
        categorias[0];
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
 * Consultas detalladas
 */
async function handleQuery(userId, message, history) {
  try {
    const range = extractTimeRange(message);

    const expenses = await chatDataService.getExpenses(userId, {
      ...range,
      limit: 10,
    });
    const incomes = await chatDataService.getIncomes(userId, {
      ...range,
      limit: 10,
    });
    const expenseSum = await chatDataService.getExpenseSummary(userId, range);
    const incomeSum = await chatDataService.getIncomeSummary(userId, range);
    const byCategory = await chatDataService.getExpensesByCategory(
      userId,
      range
    );

    const totalIngresos = Number(incomeSum?.total_monto || 0);
    const totalGastos = Number(expenseSum?.total_monto || 0);
    const balance = totalIngresos - totalGastos;

    const financialData = {
      gastos: expenses,
      ingresos: incomes,
      resumen: {
        total_gastos: totalGastos,
        total_ingresos: totalIngresos,
        balance_neto: balance,
        estado: balance >= 0 ? 'A favor 🟢' : 'En contra 🔴',
      },
      por_categoria: byCategory,
      periodo: range.label || 'todos los registros',
    };

    return await openRouterService.generateQueryResponse(
      message,
      financialData,
      history
    );
  } catch (error) {
    console.error('❌ Error consulta:', error);
    return 'No pude obtener esa información ahora 😕';
  }
}

/**
 * Extraer rango de tiempo
 */
function extractTimeRange(message) {
  const today = new Date();
  const msg = message.toLowerCase();

  if (msg.includes('hoy')) {
    const date = today.toISOString().split('T')[0];
    return { startDate: date, endDate: date, label: 'hoy' };
  }

  if (msg.includes('semana')) {
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      label: 'esta semana',
    };
  }

  if (msg.includes('mes')) {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      label: 'este mes',
    };
  }

  return { label: 'todos los registros' };
}

/* ==================================================
   EXPORT
================================================== */
export default {
  processMessage,
};
