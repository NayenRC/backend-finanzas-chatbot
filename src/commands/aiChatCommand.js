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

/**
 * Handle expense recording flow
 */
async function handleExpenseRecording(userId, userMessage) {
    try {
        // Get available categories
        const categories = await supabaseService.getCategories('GASTO');

        // Use AI to extract expense data
        const expenseData = await openRouterService.classifyExpense(userMessage, categories);

        if (expenseData.error) {
            return `❌ ${expenseData.error}\n\nPor favor intenta algo como: "Gasté 5000 en almuerzo"`;
        }

        // Find or use default category
        let categoria = await supabaseService.findCategoryByName(expenseData.categoria, 'GASTO');

        if (!categoria && categories.length > 0) {
            // Use first available category as default
            categoria = categories.find(c => c.nombre.toLowerCase().includes('otro')) || categories[0];
            console.log(`⚠️ Categoría "${expenseData.categoria}" no encontrada, usando: ${categoria.nombre}`);
        }

        if (!categoria) {
            return '❌ No hay categorías de gastos disponibles. Por favor contacta al administrador.';
        }

        // Save expense to database
        const expense = await supabaseService.createExpense(userId, {
            monto: expenseData.monto,
            descripcion: expenseData.descripcion,
            categoria_id: categoria.id_categoria,
            fecha: new Date().toISOString().split('T')[0]
        });

        return `✅ Gasto registrado exitosamente!\n\n💸 Monto: $${expenseData.monto.toLocaleString('es-CL')}\n📝 Descripción: ${expenseData.descripcion}\n🏷️ Categoría: ${categoria.nombre}`;

    } catch (error) {
        console.error('❌ Error registrando gasto:', error);
        return '❌ Hubo un error al registrar el gasto. Por favor intenta de nuevo.';
    }
}

/**
 * Handle income recording flow
 */
async function handleIncomeRecording(userId, userMessage) {
    try {
        // Get available categories
        const categories = await supabaseService.getCategories('INGRESO');

        // Use AI to extract income data
        const incomeData = await openRouterService.classifyExpense(userMessage, categories);

        if (incomeData.error) {
            return `❌ ${incomeData.error}\n\nPor favor intenta algo como: "Recibí 50000 de sueldo"`;
        }

        // Find or use default category
        let categoria = await supabaseService.findCategoryByName(incomeData.categoria, 'INGRESO');

        if (!categoria && categories.length > 0) {
            categoria = categories.find(c => c.nombre.toLowerCase().includes('otro')) || categories[0];
            console.log(`⚠️ Categoría "${incomeData.categoria}" no encontrada, usando: ${categoria.nombre}`);
        }

        // Save income to database
        const income = await supabaseService.createIncome(userId, {
            monto: incomeData.monto,
            descripcion: incomeData.descripcion,
            categoria_id: categoria?.id_categoria || null,
            fecha: new Date().toISOString().split('T')[0]
        });

        return `✅ Ingreso registrado exitosamente!\n\n💰 Monto: $${incomeData.monto.toLocaleString('es-CL')}\n📝 Descripción: ${incomeData.descripcion}${categoria ? `\n🏷️ Categoría: ${categoria.nombre}` : ''}`;

    } catch (error) {
        console.error('❌ Error registrando ingreso:', error);
        return '❌ Hubo un error al registrar el ingreso. Por favor intenta de nuevo.';
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
        const summary = await supabaseService.getExpenseSummary(userId, timeRange);
        const byCategory = await supabaseService.getExpensesByCategory(userId, timeRange);

        // Prepare data for AI
        const financialData = {
            gastos: expenses.slice(0, 10), // Last 10 expenses
            ingresos: incomes.slice(0, 10), // Last 10 incomes
            resumen: summary,
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
