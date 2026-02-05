import openRouterService from './openRouterService.js';
import chatDataService from './chatDataServices.js';
import MetaAhorroService from "./metaAhorroService.js";
import MetaAhorro from '../models/MetaAhorro.js';


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

      case 'CREAR_META':
      case 'CREAR_META_AHORRO':
        response = await handleCreateSavingGoal(userId, userMessage);
        break;

      case 'AGREGAR_A_META':
        response = await handleSavingMovement(userId, userMessage);
        break;

      case 'CONSULTAR':
        response =
          '📊 Tus métricas se muestran en el Dashboard web.\n\n' +
          '👉 Ingresa a https://smartfin-front.vercel.app/ para ver gráficos y detalles.';
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
//metas 
async function handleCreateSavingGoal(userId, message) {
  try {
    if (!userId) {
      return "🔗 Para crear metas debes vincular tu cuenta con SmartFin.\n👉 Ve al Dashboard y vincúlala.";
    }

    const goalData = await openRouterService.classifySavingGoal(message);
    const esMensual = /mes|mensual/i.test(message);

    if (esMensual && !goalData.monto_objetivo) {
      return (
        "💡 Veo que hablas de un ahorro mensual.\n\n" +
        "🎯 Para crear la meta necesito el **monto total**.\n" +
        "Ejemplo:\n*Quiero ahorrar 5 millones para un auto*"
      );
    }

    if (!goalData.monto_objetivo && !esMensual) {
      const match = message.match(/(\d{1,3}(?:[.,]\d{3})*|\d+)\s*(mil|lucas|millon|millones)?/i);
      if (match) {
        const base = Number(match[1].replace(/[.,]/g, ''));
        const unidad = match[2]?.toLowerCase();

        if (unidad === 'mil' || unidad === 'lucas') {
          goalData.monto_objetivo = base * 1_000;
        } else if (unidad === 'millon' || unidad === 'millones') {
          goalData.monto_objetivo = base * 1_000_000;
        } else {
          goalData.monto_objetivo = base;
        }
      }
    }

    if (!goalData.nombre) {
      const matchNombre = message.match(/para (un|una)?\s?(.+)/i);
      if (matchNombre) goalData.nombre = matchNombre[2];
    }

    if (!goalData.nombre || !goalData.monto_objetivo) {
      return (
        "🎯 Para crear tu meta dime el **monto total** y el objetivo.\n\n" +
        "Ejemplos:\n• *Quiero ahorrar 5 millones para un auto*\n• *Ahorrar 2 millones para vacaciones*"
      );
    }

    await MetaAhorroService.crearMeta(userId, {
      nombre: goalData.nombre,
      monto_objetivo: goalData.monto_objetivo,
    });

    return `🏆 **Meta creada con éxito**

🎯 ${goalData.nombre}
💰 Objetivo: $${goalData.monto_objetivo.toLocaleString('es-CL')}

👉 Puedes aportar diciendo:
*Ahorra 50 lucas para ${goalData.nombre}*`;

  } catch (err) {
    console.error("❌ Error creando meta:", err);
    return "❌ Ocurrió un error al crear la meta 😕";
  }
}



async function handleSavingMovement(userId, message) {
  try {
    // 1️⃣ Obtener metas del usuario
    const metas = await MetaAhorro.getByUser(userId);

    if (!metas.length) {
      return "⚠️ Aún no tienes metas creadas. Dime primero qué meta quieres crear 🎯";
    }

    // 2️⃣ IA identifica meta + monto
    const movement = await openRouterService.classifySavingMovement(
      message,
      metas
    );

    if (movement.error || !movement.meta || !movement.monto) {
      return (
        movement.sugerencia ||
        "💰 Dime cuánto quieres ahorrar y para qué meta.\nEjemplo: *Ahorra 20 lucas para el viaje*"
      );
    }

    const meta = metas.find(m =>
      m.nombre.toLowerCase().includes(movement.meta.toLowerCase())
    );

    if (!meta) {
      return `❌ No encontré la meta "${movement.meta}"`;
    }

    const result = await MetaAhorroService.agregarMovimiento(
      meta.id_meta,
      userId,
      movement.monto,
      new Date()
    );

    return `💸 **Ahorro registrado**

🎯 Meta: ${meta.nombre}
💰 Aporte: $${movement.monto.toLocaleString('es-CL')}
📊 Progreso: $${result.progreso.actual.toLocaleString('es-CL')} / $${result.progreso.objetivo.toLocaleString('es-CL')}

${result.progreso.completada ? '🎉 ¡Meta completada!' : '¡Sigue así! 💪'}`;
  } catch (err) {
    console.error("❌ Error movimiento ahorro:", err);
    return "❌ No pude registrar el ahorro 😕";
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
