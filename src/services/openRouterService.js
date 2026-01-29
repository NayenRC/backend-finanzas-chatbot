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

    const systemPrompt = `Eres SmartFin, un asistente financiero experto, empático y profesional.
Tu objetivo es ayudar al usuario a registrar sus finanzas de forma sencilla y agradable.

Categorías disponibles: ${categoryList || 'Salario, Ventas, Alimentación, Transporte, Vivienda, Salud, Educación, Otros'}

Analiza el mensaje del usuario y extrae la información necesaria. 

REGLAS DE ORO:
- Si el usuario menciona un monto y algo que parece un gasto, clasifícalo como "GASTO".
- Si el usuario menciona un monto y algo que parece un ingreso (sueldo, pago, recibí, venta), clasifícalo como "INGRESO".
- Si falta información crítica (como el monto), NO inventes datos, pero intenta identificar el tipo y descripción si es posible.

Responde ÚNICAMENTE con un JSON válido:
{
  "tipo": "GASTO" | "INGRESO",
  "monto": número o null,
  "descripcion": "texto breve",
  "categoria": "nombre de categoría",
  "confianza": 0-1,
  "info_faltante": ["monto", "descripcion"] | [] 
}

Si el mensaje es demasiado ambiguo, responde:
{
  "error": "necesito más detalles",
  "sugerencia": "Por favor, dime el monto y en qué consistió el movimiento. Ejemplo: 'Gasté 5000 en café'"
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
 * Classify and extract income data from natural language (supports Chilean slang)
 */
async function classifyIncome(userMessage, categories = []) {
    const categoryList = categories.map(c => c.nombre).join(', ');

    const systemPrompt = `Eres un asistente especializado en finanzas personales.
Tu tarea es analizar un mensaje del usuario y determinar si contiene un INGRESO.
Extrae la información en formato JSON ESTRICTO, sin texto adicional.

Reglas importantes:
- El monto debe devolverse SIEMPRE como un número entero en pesos chilenos (CLP).
- Convierte expresiones como:
  - "100 lucas" → 100000
  - "2 palos" → 2000000
  - "1.5 millones" → 1500000
- Si el monto no está claro, indícalo en "info_faltante".
- No inventes datos.
- Usa solo categorías de la lista: ${categoryList || 'Salario, Ventas, Otros'}

Formato de respuesta OBLIGATORIO:
{
  "monto": number | null,
  "descripcion": string | null,
  "categoria": string | null,
  "info_faltante": string[],
  "error": boolean,
  "sugerencia": string | null
}

Criterios:
- Si el mensaje contiene claramente un ingreso: error = false
- Si NO se puede confirmar un ingreso: error = true y sugerencia clara y corta.`;

    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
    ];

    try {
        const response = await sendMessage(messages, { temperature: 0.1 });
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Respuesta de IA no es JSON');

        const data = JSON.parse(jsonMatch[0]);
        // Para compatibilidad con la lógica existente que usa data.error como string
        if (data.error === true) data.error = data.sugerencia || 'No se pudo identificar el ingreso';
        else if (data.error === false) delete data.error;

        return data;
    } catch (error) {
        console.error('❌ Error clasificando ingreso:', error);
        return { error: 'Lo siento, no pude procesar tu ingreso. ¿Podrías intentar de nuevo con más detalles?' };
    }
}

/**
 * Generate a natural language response based on expense data
 */
async function generateQueryResponse(userMessage, expenseData, chatHistory = []) {
    const systemPrompt = `Eres SmartFin, el asistente financiero personal del usuario. 
Eres empático, motivador y muy profesional. Tu tono siempre es cálido y servicial.

Tu trabajo es ayudar al usuario a entender sus finanzas.

Cuando respondas:
- Sé amable y usa un lenguaje natural (ej: "¡Hola! He analizado tus números...")
- Usa emojis de forma equilibrada (💰, 📈, ✨)
- Formatea siempre los montos con separadores de miles y signo de peso (ej: $10.000)
- Si el balance es negativo, sé alentador y ofrece consejos breves de ahorro.
- Si el balance es positivo, felicita al usuario.
- NO uses símbolos ### para títulos. Usa **Negritas** y listas con puntos.
- Si ves una tendencia preocupante (muchos gastos en una categoría), menciónalo con respeto.

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
    const systemPrompt = `Eres SmartFin, un asistente financiero amigable y sofisticado.

Cuando el usuario te salude o te hable:
- Responde con calidez y profesionalismo.
- Si te preguntan algo general, explica que puedes ayudarlos a registrar gastos, ingresos y darles resúmenes de su dinero.
- Usa frases amables como "Es un gusto saludarte", "¡Claro que sí! Estoy aquí para ayudarte", etc.
- Mantén tus respuestas concisas pero humanas.
- Usa emojis para dar personalidad.`;

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