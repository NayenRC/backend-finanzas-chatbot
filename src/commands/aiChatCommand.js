/**
 * AI Chat Command
 * 
 * Main command handler for AI-powered chat interactions.
 * Handles both expense recording and query flows using OpenRouter AI.
 */

import openRouterService from '../services/openRouterService.js';
import supabaseService from '../services/supabaseService.js';

/**
 * Process a chat message from the user
 */
async function processMessage(userId, userMessage) {
    try {
        // Get chat history for context
        const chatHistory = await supabaseService.getChatHistory(userId, 6);
        const formattedHistory = chatHistory.map(msg => ({
            role: msg.rol === 'USUARIO' ? 'user' : 'assistant',
            content: msg.mensaje
        }));

        // Save user message
        await supabaseService.saveChatMessage(userId, 'USUARIO', userMessage);

        // Analyze user intent
        const { intencion, confianza } = await openRouterService.analyzeIntent(userMessage);

        console.log(`🤖 Intención detectada: ${intencion} (confianza: ${confianza})`);

        let response;

        // Route to appropriate handler based on intent
        switch (intencion) {
            case 'REGISTRAR_GASTO':
                response = await handleExpenseRecording(userId, userMessage);
                break;

            case 'REGISTRAR_INGRESO':
                response = await handleIncomeRecording(userId, userMessage);
                break;

            case 'CONSULTAR':
                response = await handleQuery(userId, userMessage, formattedHistory);
                break;

            default:
                response = await openRouterService.generateGeneralResponse(userMessage, formattedHistory);
        }

        // Save bot response
        await supabaseService.saveChatMessage(userId, 'BOT', response);

        return {
            success: true,
            response,
            intent: intencion
        };

    } catch (error) {
        console.error('❌ Error procesando mensaje:', error);

        const errorResponse = 'Lo siento, tuve un problema al procesar tu mensaje. Por favor intenta de nuevo.';
        await supabaseService.saveChatMessage(userId, 'BOT', errorResponse);

        return {
            success: false,
            response: errorResponse,
            error: error.message
        };
    }
}

async function handleExpenseRecording(userId, userMessage) {
    try {
        console.log(`📝 Registrando gasto para usuario ${userId}: "${userMessage}"`);

        // Get available categories
        const categories = await supabaseService.getCategories('GASTO');

        // Use AI to extract expense data
        const expenseData = await openRouterService.classifyExpense(userMessage, categories);

        if (expenseData.error) {
            return `¡Hola! 👋 ${expenseData.sugerencia || 'Para registrar un gasto, necesito saber el monto y en qué consistió. ¿Me podrías dar más detalles?'}`;
        }

        if (expenseData.info_faltante && expenseData.info_faltante.length > 0) {
            if (expenseData.info_faltante.includes('monto')) {
                return `Entiendo que quieres registrar un gasto sobre "**${expenseData.descripcion || 'algo'}**", pero me falta el monto. 💰 ¿Cuánto gastaste aproximadamente?`;
            }
        }

        // Find or use default category
        let categoria = null;

        if (expenseData.categoria) {
            categoria = await supabaseService.findCategoryByName(expenseData.categoria, 'GASTO');
        }

        if (!categoria && categories.length > 0) {
            categoria = categories.find(c => c.nombre.toLowerCase().includes('otro')) || categories[0];
        }

        // Save expense to database
        const expense = await supabaseService.createExpense(userId, {
            monto: expenseData.monto,
            descripcion: expenseData.descripcion,
            categoria_id: categoria?.id_categoria || null,
            fecha: new Date().toISOString().split('T')[0]
        });

        return `¡Listo! ✨ He registrado tu gasto:\n\n💸 **Monto**: $${expenseData.monto.toLocaleString('es-CL')}\n📝 **Descripción**: ${expenseData.descripcion}\n🏷️ **Categoría**: ${categoria?.nombre || 'General'}\n\n¿Quieres registrar algo más o prefieres ver un resumen? 😊`;

    } catch (error) {
        console.error('❌ Error registrando gasto:', error);
        return `Lo siento, tuve un pequeño problema técnico al guardar ese gasto. 😅 ¿Podrías intentar decírmelo de nuevo?`;
    }
}

async function handleIncomeRecording(userId, userMessage) {
    try {
        console.log(`📝 Registrando ingreso para usuario ${userId}: "${userMessage}"`);

        // Get available categories
        const categories = await supabaseService.getCategories('INGRESO');

        // Use AI to extract income data
        const incomeData = await openRouterService.classifyIncome(userMessage, categories);

        if (incomeData.error) {
            return `¡Hola! 👋 ${incomeData.sugerencia || 'Para registrar un ingreso, necesito saber el monto y de dónde proviene. ¿Me podrías dar más detalles?'}`;
        }

        if (incomeData.info_faltante && incomeData.info_faltante.length > 0) {
            if (incomeData.info_faltante.includes('monto')) {
                return `¡Genial que hayas recibido dinero! 💰 Pero me falta saber el monto de "**${incomeData.descripcion || 'este ingreso'}**". ¿Cuánto fue el valor?`;
            }
        }

        // Validación extra de seguridad
        if (!incomeData.monto || isNaN(incomeData.monto)) {
            return `No pude captar el monto exacto de "**${incomeData.descripcion || 'tu ingreso'}**". 💰 ¿Me podrías decir cuánto fue? (ej: "fueron 10 lucas")`;
        }

        // Find or use default category
        let categoria = null;

        if (incomeData.categoria) {
            categoria = await supabaseService.findCategoryByName(incomeData.categoria, 'INGRESO');
        }

        if (!categoria && categories.length > 0) {
            categoria = categories.find(c => c.nombre.toLowerCase().includes('otro')) || categories[0];
        }

        // Save income to database
        const income = await supabaseService.createIncome(userId, {
            monto: incomeData.monto,
            descripcion: incomeData.descripcion,
            categoria_id: categoria?.id_categoria || null,
            fecha: new Date().toISOString().split('T')[0]
        });

        return `¡Excelente! 🌟 He registrado tu ingreso:\n\n💰 **Monto**: $${incomeData.monto.toLocaleString('es-CL')}\n📝 **Descripción**: ${incomeData.descripcion}\n🏷️ **Categoría**: ${categoria?.nombre || 'General'}\n\n¡Qué bueno ver que tu balance crece! ¿Te gustaría revisar cómo van tus finanzas hoy?`;

    } catch (error) {
        console.error('❌ Error registrando ingreso:', error);
        return `Lo siento, algo no salió bien al guardar tu ingreso: ${error.message}. 😕 ¿Podrías volver a intentarlo?`;
    }
}

/**
 * Handle query flow
 */
async function handleQuery(userId, userMessage, chatHistory) {
    try {
        // Determine time range from query (this week, this month, etc.)
        const timeRange = extractTimeRange(userMessage);

        // Get expense data
        const expenses = await supabaseService.getExpenses(userId, timeRange);
        const incomes = await supabaseService.getIncomes(userId, timeRange);
        const expenseSummary = await supabaseService.getExpenseSummary(userId, timeRange);
        const incomeSummary = await supabaseService.getIncomeSummary(userId, timeRange);
        const byCategory = await supabaseService.getExpensesByCategory(userId, timeRange);

        // Calcular Balance
        const totalIngresos = Number(incomeSummary?.total_monto || 0);
        const totalGastos = Number(expenseSummary?.total_monto || 0);
        const balance = totalIngresos - totalGastos;

        // Prepare data for AI
        const financialData = {
            gastos: expenses.slice(0, 10), // Last 10 expenses
            ingresos: incomes.slice(0, 10), // Last 10 incomes
            resumen_financiero: {
                total_gastos: totalGastos,
                total_ingresos: totalIngresos,
                balance_neto: balance,
                estado: balance >= 0 ? 'A favor 🟢' : 'En contra 🔴'
            },
            por_categoria: byCategory,
            periodo: timeRange.label || 'todos los registros'
        };

        // Generate natural language response
        const response = await openRouterService.generateQueryResponse(
            userMessage,
            financialData,
            chatHistory
        );

        return response;

    } catch (error) {
        console.error('❌ Error procesando consulta:', error);
        return '❌ Hubo un error al consultar tus datos. Por favor intenta de nuevo.';
    }
}

/**
 * Extract time range from user message
 */
function extractTimeRange(message) {
    const today = new Date();
    const messageLower = message.toLowerCase();

    // Today
    if (messageLower.includes('hoy')) {
        return {
            startDate: today.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0],
            label: 'hoy'
        };
    }

    // This week
    if (messageLower.includes('semana')) {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return {
            startDate: startOfWeek.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0],
            label: 'esta semana'
        };
    }

    // This month
    if (messageLower.includes('mes')) {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
            startDate: startOfMonth.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0],
            label: 'este mes'
        };
    }

    // Last 7 days
    if (messageLower.includes('últimos') || messageLower.includes('ultimos')) {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return {
            startDate: sevenDaysAgo.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0],
            label: 'últimos 7 días'
        };
    }

    // Default: all time
    return {
        label: 'todos los registros'
    };
}

export default {
    processMessage,
};