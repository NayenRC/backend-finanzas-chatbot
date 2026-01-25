/**
 * OpenRouter Service
 * 
 * Service to handle OpenRouter AI API interactions for natural language processing
 * of expense tracking and financial queries.
 */

import axios from 'axios';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
    throw new Error('❌ OPENROUTER_API_KEY no está configurado en .env');
}

// Default model - cost-effective and fast
const DEFAULT_MODEL = 'openai/gpt-4o-mini';

/**
 * Send a message to OpenRouter AI
 */
async function sendMessage(messages, options = {}) {
    const {
        model = DEFAULT_MODEL,
        temperature = 0.7,
        max_tokens = 1000,
    } = options;

    try {
        const response = await axios.post(
            OPENROUTER_API_URL,
            {
                model,
                messages,
                temperature,
                max_tokens,
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'http://localhost:3000',
                    'X-Title': 'SmartFin Backend',
                },
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('❌ Error en OpenRouter:', error.response?.data || error.message);
        throw new Error('Error al comunicarse con la IA');
    }
}

/**
 * Classify and extract expense data from natural language
 */
async function classifyExpense(userMessage, categories = []) {
    const categoryList = categories.map(c => c.nombre).join(', ');

    const systemPrompt = `Eres un asistente financiero que extrae información de gastos e ingresos del texto del usuario.

Categorías disponibles: ${categoryList || 'Alimentación, Transporte, Entretenimiento, Salud, Servicios, Otros'}

Analiza el mensaje del usuario y extrae:
1. tipo: "GASTO" o "INGRESO"
2. monto: número (solo el valor numérico)
3. descripcion: breve descripción del gasto/ingreso
4. categoria: nombre de la categoría que mejor coincida (de las disponibles)

Responde SOLO con un JSON válido en este formato:
{
  "tipo": "GASTO",
  "monto": 5000,
  "descripcion": "almuerzo",
  "categoria": "Alimentación",
  "confianza": 0.95
}

Si no puedes extraer la información, responde con:
{
  "error": "No pude identificar un gasto o ingreso en el mensaje"
}`;

    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
    ];

    try {
        const response = await sendMessage(messages, { temperature: 0.3 });

        // Parse JSON response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Respuesta inválida de la IA');
        }

        const data = JSON.parse(jsonMatch[0]);
        return data;
    } catch (error) {
        console.error('❌ Error clasificando gasto:', error);
        return { error: 'No pude procesar tu mensaje. Intenta ser más específico.' };
    }
}

/**
 * Generate a natural language response based on expense data
 */
async function generateQueryResponse(userMessage, expenseData, chatHistory = []) {
    const systemPrompt = `Eres SmartFin, un asistente financiero amigable y útil.

Tu trabajo es ayudar al usuario a entender sus finanzas personales.

Cuando respondas:
- Sé conciso y claro
- Usa emojis apropiados (💰, 💸, 📊, etc.)
- Formatea los montos con separadores de miles
- Proporciona insights útiles cuando sea relevante
- Si no tienes datos suficientes, sé honesto

Datos financieros del usuario:
${JSON.stringify(expenseData, null, 2)}`;

    const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.slice(-6), // Include last 3 exchanges for context
        { role: 'user', content: userMessage }
    ];

    try {
        const response = await sendMessage(messages, { temperature: 0.7, max_tokens: 500 });
        return response;
    } catch (error) {
        console.error('❌ Error generando respuesta:', error);
        return 'Lo siento, tuve un problema al procesar tu consulta. Por favor intenta de nuevo.';
    }
}

/**
 * Determine user intent (expense recording vs query)
 */
async function analyzeIntent(userMessage) {
    const systemPrompt = `Analiza el mensaje del usuario y determina su intención.

Posibles intenciones:
1. "REGISTRAR_GASTO" - El usuario quiere registrar un gasto (ej: "gasté 5000 en almuerzo", "compré pan por 2000")
2. "REGISTRAR_INGRESO" - El usuario quiere registrar un ingreso (ej: "recibí 50000 de sueldo", "me pagaron 10000")
3. "CONSULTAR" - El usuario quiere consultar información (ej: "¿cuánto gasté?", "muéstrame mis gastos", "resumen de la semana")
4. "OTRO" - Cualquier otra cosa (saludos, preguntas generales, etc.)

Responde SOLO con un JSON:
{
  "intencion": "REGISTRAR_GASTO" | "REGISTRAR_INGRESO" | "CONSULTAR" | "OTRO",
  "confianza": 0.95
}`;

    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
    ];

    try {
        const response = await sendMessage(messages, { temperature: 0.2, max_tokens: 100 });

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return { intencion: 'OTRO', confianza: 0.5 };
        }

        const data = JSON.parse(jsonMatch[0]);
        return data;
    } catch (error) {
        console.error('❌ Error analizando intención:', error);
        return { intencion: 'OTRO', confianza: 0.5 };
    }
}

/**
 * Generate a friendly greeting or general response
 */
async function generateGeneralResponse(userMessage, chatHistory = []) {
    const systemPrompt = `Eres SmartFin, un asistente financiero amigable.

Cuando el usuario te salude o haga preguntas generales:
- Responde de manera amigable y profesional
- Menciona brevemente qué puedes hacer (registrar gastos/ingresos, consultar finanzas)
- Usa emojis apropiados
- Sé conciso (máximo 2-3 líneas)`;

    const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.slice(-4),
        { role: 'user', content: userMessage }
    ];

    try {
        const response = await sendMessage(messages, { temperature: 0.8, max_tokens: 200 });
        return response;
    } catch (error) {
        console.error('❌ Error generando respuesta general:', error);
        return '¡Hola! 👋 Soy SmartFin, tu asistente financiero. Puedo ayudarte a registrar gastos e ingresos, y consultar tus finanzas. ¿En qué te puedo ayudar?';
    }
}

export default {
    sendMessage,
    classifyExpense,
    generateQueryResponse,
    analyzeIntent,
    generateGeneralResponse,
};
