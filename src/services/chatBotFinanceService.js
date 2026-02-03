import openRouterService from '../services/openRouterService.js';
import ChatMensaje from '../models/ChatMensaje.js';
import Ingreso from '../models/Ingreso.js';
import Categoria from '../models/Categoria.js';
import Gasto from '../models/Gasto.js';
import MetaAhorroService from '../services/metaAhorroService.js';
import MetaAhorro from '../models/MetaAhorro.js';

const SHORT_MESSAGE_REPLY =
  'Hola 👋 ¿En qué te puedo ayudar? Puedes registrar gastos, ingresos o metas 😊';

const IA_FALLBACK_REPLY =
  'Hola 👋 Estoy activo, pero ahora mismo no puedo responder con IA. ' +
  'Puedes registrar gastos, ingresos o metas y seguiré funcionando 😊';

/* =====================================================
   FUNCIÓN PRINCIPAL DEL BOT
===================================================== */
async function processMessage(userId, userMessage) {
  try {
    /* ===============================
       Guardar mensaje del usuario
    =============================== */
    await ChatMensaje.query().insert({
      user_id: userId,
      mensaje: userMessage,
      rol: 'user',
    });

    /* ===============================
       FILTRO MENSAJES CORTOS
    =============================== */
    if (!userMessage || userMessage.trim().length < 3) {
      await ChatMensaje.query().insert({
        user_id: userId,
        mensaje: SHORT_MESSAGE_REPLY,
        rol: 'assistant',
      });

      return {
        success: true,
        response: SHORT_MESSAGE_REPLY,
        intent: 'SALUDO',
      };
    }

    /* ===============================
       HISTORIAL DE CHAT
    =============================== */
    const chatHistory = await ChatMensaje.findByUser(userId);

    const formattedHistory = chatHistory
      .slice(-6)
      .map((msg) => ({
        role: msg.rol,
        content: msg.mensaje,
      }));

    /* ===============================
       DETECTAR INTENCIÓN (IA)
    =============================== */
    let intencion = 'OTRO';

    try {
      const intentResult = await openRouterService.analyzeIntent(userMessage);
      intencion = intentResult.intencion || 'OTRO';
    } catch (err) {
      console.warn('⚠️ No se pudo analizar intención, usando OTRO');
    }

    let response;

    /* ===============================
       RUTEO POR INTENCIÓN
    =============================== */
    try {
      switch (intencion) {
        case 'REGISTRAR_GASTO':
          response = await handleExpenseRecording(userId, userMessage);
          break;

        case 'REGISTRAR_INGRESO':
          response = await handleIncomeRecording(userId, userMessage);
          break;

        case 'CREAR_META_AHORRO':
          response = await handleCreateSavingGoal(userId, userMessage);
          break;

        case 'AGREGAR_A_META':
          response = await handleAddToSavingGoal(userId, userMessage);
          break;

        case 'CONSULTAR':
          response = await handleQuery(
            userId,
            userMessage,
            formattedHistory
          );
          break;

        default:
          response = await openRouterService.generateGeneralResponse(
            userMessage,
            formattedHistory
          );
      }
    } catch (err) {
      console.error('⚠️ IA falló:', err.message);
      response = IA_FALLBACK_REPLY;
    }

    if (!response) response = IA_FALLBACK_REPLY;

    /* ===============================
       GUARDAR RESPUESTA DEL BOT
    =============================== */
    await ChatMensaje.query().insert({
      user_id: userId,
      mensaje: response,
      rol: 'assistant',
    });

    return {
      success: true,
      response,
      intent: intencion,
    };
  } catch (error) {
    console.error('❌ Error crítico en chatbot:', error);

    return {
      success: false,
      response:
        'Estoy activo 😊 Hubo un problema momentáneo, intenta de nuevo.',
    };
  }
}

/* =====================================================
   FUNCIONES DE NEGOCIO
===================================================== */

async function handleExpenseRecording(userId, userMessage) {
  try {
    const categorias = await Categoria.findByUser(userId);

    const expenseData = await openRouterService.classifyExpense(
      userMessage,
      categorias
    );

    if (expenseData?.error) {
      return (
        expenseData.sugerencia ||
        'Para registrar un gasto necesito el monto y una descripción 💸'
      );
    }

    if (!expenseData.monto || isNaN(expenseData.monto)) {
      return 'No pude entender el monto del gasto 🤔';
    }

    let categoria =
      categorias.find((c) =>
        c.nombre
          .toLowerCase()
          .includes(expenseData.categoria?.toLowerCase() || '')
      ) || categorias[0];

    await Gasto.query().insert({
      user_id: userId,
      monto: expenseData.monto,
      descripcion: expenseData.descripcion || 'Gasto registrado por chatbot',
      categoria_id: categoria?.id_categoria || null,
      fecha: new Date().toISOString().split('T')[0],
    });

    return `¡Listo! ✨ Registré tu gasto:

💸 Monto: $${expenseData.monto.toLocaleString('es-CL')}
📝 ${expenseData.descripcion || 'Sin descripción'}
🏷️ ${categoria?.nombre || 'General'}`;
  } catch (err) {
    console.error('❌ Error gasto:', err);
    return 'Tuve un problema al guardar el gasto 😕';
  }
}

async function handleIncomeRecording(userId, userMessage) {
  try {
    const categorias = await Categoria.findByUser(userId);

    const incomeData = await openRouterService.classifyIncome(
      userMessage,
      categorias
    );

    if (!incomeData.monto || isNaN(incomeData.monto)) {
      return 'No pude entender el monto del ingreso 🤔';
    }

    let categoria =
      categorias.find((c) =>
        c.nombre
          .toLowerCase()
          .includes(incomeData.categoria?.toLowerCase() || '')
      ) || categorias[0];

    await Ingreso.query().insert({
      user_id: userId,
      monto: incomeData.monto,
      descripcion: incomeData.descripcion || 'Ingreso registrado por chatbot',
      categoria_id: categoria?.id_categoria || null,
      fecha: new Date().toISOString().split('T')[0],
    });

    return `¡Excelente! 🌟 Registré tu ingreso:

💰 $${incomeData.monto.toLocaleString('es-CL')}
📝 ${incomeData.descripcion || 'Sin descripción'}`;
  } catch (err) {
    console.error('❌ Error ingreso:', err);
    return 'Tuve un problema al guardar el ingreso 😕';
  }
}

async function handleQuery(userId, userMessage, history) {
  try {
    const gastos = await Gasto.findByUser(userId);
    const ingresos = await Ingreso.findByUser(userId);

    return await openRouterService.generateQueryResponse(
      userMessage,
      { gastos, ingresos },
      history
    );
  } catch (err) {
    console.error('❌ Error consulta:', err);
    return IA_FALLBACK_REPLY;
  }
}

async function handleCreateSavingGoal(userId, userMessage) {
  try {
    const goalData =
      await openRouterService.classifySavingGoal(userMessage);

    if (!goalData.monto_objetivo) {
      return '¿Cuánto quieres ahorrar en esta meta? 💰';
    }

    const meta = await MetaAhorroService.crearMeta(userId, {
      nombre: goalData.nombre,
      monto_objetivo: goalData.monto_objetivo,
    });

    return `🎯 Meta creada: ${meta.nombre}
💰 Objetivo: $${meta.monto_objetivo.toLocaleString('es-CL')}`;
  } catch (err) {
    console.error('❌ Error meta:', err);
    return 'No pude crear la meta 😕';
  }
}

async function handleAddToSavingGoal(userId, userMessage) {
  try {
    const metas = await MetaAhorro.findByUser(userId);

    if (!metas.length) {
      return 'Aún no tienes metas de ahorro 😕';
    }

    const data =
      await openRouterService.classifySavingMovement(userMessage, metas);

    if (!data.monto) {
      return '¿Cuánto deseas agregar a la meta? 💰';
    }

    const meta = metas.find((m) =>
      m.nombre.toLowerCase().includes(data.meta?.toLowerCase() || '')
    );

    if (!meta) {
      return 'No pude identificar la meta 😕';
    }

    const result = await MetaAhorroService.agregarMovimiento(
      meta.id_meta,
      userId,
      data.monto,
      new Date().toISOString().split('T')[0]
    );

    return `💰 Ahorro agregado a ${meta.nombre}
Progreso: $${result.progreso.actual.toLocaleString('es-CL')}`;
  } catch (err) {
    console.error('❌ Error ahorro:', err);
    return 'No pude registrar el ahorro 😕';
  }
}

export default {
  processMessage,
};
