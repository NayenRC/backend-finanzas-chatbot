/**
 * OpenRouterService
 *
 * Servicio único para interactuar con OpenRouter AI.
 * Responsabilidad EXCLUSIVA:
 * - Enviar prompts a la IA
 * - Recibir respuestas
 * - Devolver texto o JSON
 *
 */

import axios from 'axios';
import 'dotenv/config';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Modelo por defecto (rápido y económico)
const DEFAULT_MODEL = 'openai/gpt-4o-mini';

class OpenRouterService {

    /* ===============================
       Método base de comunicación
    =============================== */
    async sendMessage(messages, options = {}) {
        if (!OPENROUTER_API_KEY) {
            console.warn('⚠️ OPENROUTER_API_KEY no configurada. IA deshabilitada.');
            return null;
        }

        const {
            model = DEFAULT_MODEL,
            temperature = 0.5,
            max_tokens = 800,
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
                        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                        'Content-Type': 'application/json',
                        'X-Title': 'SmartFin Backend',
                    },
                }
            );

            return response.data.choices[0].message.content;

        } catch (error) {
            console.error('❌ OPENROUTER ERROR:');
            console.error(error?.message);
            console.error(error?.response?.data || error);
            throw error;
        }
    }

    /* ===============================
       Analizar intención del usuario
    =============================== */
    async analyzeIntent(userMessage) {
        const systemPrompt = `
Analiza el mensaje del usuario y determina su intención.

Posibles intenciones:
- REGISTRAR_GASTO
- REGISTRAR_INGRESO
- CONSULTAR
- CREAR_META_AHORRO
- AGREGAR_A_META
-CREAR_META
- OTRO

Responde SOLO con JSON:
{
  "intencion": "REGISTRAR_GASTO" | "REGISTRAR_INGRESO" | "CONSULTAR" |"CREAR_META"| "CREAR_META_AHORRO" | "AGREGAR_A_META" | "OTRO",
  "confianza": 0.0-1.0
}`;

        const response = await this.sendMessage([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ], { temperature: 0.2, max_tokens: 100 });

        if (!response) throw new Error('No hay respuesta de OpenRouter (Intento)');

        try {
            return JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
        } catch {
            throw new Error('Error parseando respuesta JSON de OpenRouter (Intento)');
        }
    }

    /* ===============================
       Clasificar GASTO
    =============================== */
    async classifyExpense(userMessage, categories = []) {
        const categoryList = categories.map(c => c.nombre).join(', ');

        const systemPrompt = `
Extrae información de un GASTO desde lenguaje natural.

Categorías disponibles:
${categoryList || 'Alimentación, Transporte, Salud, Educación, Otros'}

Devuelve SOLO JSON:
{
  "monto": number | null,
  "descripcion": string | null,
  "categoria": string | null,
  "info_faltante": string[],
  "error": boolean,
  "sugerencia": string | null
}

Reglas:
- No inventes datos
- Convierte "10 lucas" → 10000
- Si falta monto, indícalo en info_faltante
`;

        const response = await this.sendMessage([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ], { temperature: 0.3 });

        if (!response) throw new Error('No hay respuesta de OpenRouter (Gasto)');

        try {
            return JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
        } catch {
            throw new Error('Error parseando respuesta JSON de OpenRouter (Gasto)');
        }
    }

    /* ===============================
       Clasificar INGRESO
    =============================== */
    async classifyIncome(userMessage, categories = []) {
        const categoryList = categories.map(c => c.nombre).join(', ');

        const systemPrompt = `
Extrae información de un INGRESO desde lenguaje natural.

Reglas:
- Montos en CLP
- "500 lucas" → 500000
- No inventes datos

Categorías permitidas:
${categoryList || 'Salario, Ventas, Otros'}

Devuelve SOLO JSON:
{
  "monto": number | null,
  "descripcion": string | null,
  "categoria": string | null,
  "info_faltante": string[],
  "error": boolean,
  "sugerencia": string | null
}
`;

        const response = await this.sendMessage([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ], { temperature: 0.2 });

        if (!response) throw new Error('No hay respuesta de OpenRouter (Ingreso)');

        try {
            return JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
        } catch {
            throw new Error('Error parseando respuesta JSON de OpenRouter (Ingreso)');
        }
    }

    /* ===============================
       Respuesta a consultas financieras
    =============================== */
    async generateQueryResponse(userMessage, financialData, chatHistory = []) {
        const systemPrompt = `
Eres SmartFin, un asistente financiero empático y profesional.

Usa estos datos financieros para responder:
${JSON.stringify(financialData, null, 2)}

REGLAS DE FORMATO (MUY IMPORTANTE):
- Formatea montos en pesos chilenos con puntos como separador de miles: $2.200.000
- Sin decimales
- Símbolo $ antes del monto
- NO uses LaTeX, fórmulas matemáticas ni símbolos como \\frac, \\text, \\times
- NO uses corchetes [ ] para fórmulas
- Usa solo texto plano y emojis
- Para porcentajes escribe simplemente "55.6%" no fórmulas

Responde de forma clara, amigable y concisa.
Usa emojis para hacer la respuesta más visual 📊💰
`;

        const response = await this.sendMessage([
            { role: 'system', content: systemPrompt },
            ...chatHistory.slice(-6),
            { role: 'user', content: userMessage }
        ], { temperature: 0.7, max_tokens: 500 });

        return response;
    }

    /* ===============================
       Respuesta general / saludo
    =============================== */
    async generateGeneralResponse(userMessage, chatHistory = []) {
        const systemPrompt = `
Eres SmartFin, un asistente financiero amable.
Explica brevemente que puedes ayudar a registrar gastos, ingresos y ver resúmenes.
`;

        const response = await this.sendMessage([
            { role: 'system', content: systemPrompt },
            ...chatHistory.slice(-4),
            { role: 'user', content: userMessage }
        ], { temperature: 0.8, max_tokens: 200 });

        return response;
    }

    async classifySavingGoal(userMessage) {
        const systemPrompt = `
Extrae información para crear una META DE AHORRO.
Si el mensaje contiene palabras como:
"ahorrar", "meta", "juntar", "guardar", "objetivo"
la intención DEBE ser CREAR_META_AHORRO.

Convierte expresiones chilenas:
- "500 lucas" → 500000
- "1 palo" → 1000000

Devuelve SOLO JSON:
{
  "nombre": string | null,
  "monto_objetivo": number | null,
  "info_faltante": string[],
  "error": boolean,
  "sugerencia": string | null
}

No inventes datos.
`;

        const response = await this.sendMessage([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ], { temperature: 0.2 });

        if (!response) throw new Error('No hay respuesta de OpenRouter (Meta)');

        try {
            return JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
        } catch {
            throw new Error('Error parseando respuesta JSON de OpenRouter (Meta)');
        }
    }

    async classifySavingMovement(userMessage, metas = []) {
        const metaList = metas.map(m => m.nombre).join(', ');

        const systemPrompt = `
Extrae información para un MOVIMIENTO DE AHORRO.

Metas disponibles:
${metaList || 'Viaje, Auto, Estudios, Ahorro general'}

Convierte:
- "50 lucas" → 50000
- "100 mil" → 100000

Devuelve SOLO JSON:
{
  "meta": string | null,
  "monto": number | null,
  "info_faltante": string[],
  "error": boolean,
  "sugerencia": string | null
}

No inventes datos.
`;

        const response = await this.sendMessage([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ], { temperature: 0.2 });

        if (!response) throw new Error('No hay respuesta de OpenRouter (Movimiento)');

        try {
            return JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
        } catch {
            throw new Error('Error parseando respuesta JSON de OpenRouter (Movimiento)');
        }
    }

}

export default new OpenRouterService();
