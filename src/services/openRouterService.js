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
      console.error(
        '❌ Error comunicándose con OpenRouter:',
        error.response?.data || error.message
      );
      return null;
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
- CREAR_META_AHORRO
- AGREGAR_A_META
- OTRO

Responde SOLO con JSON:
{
  "intencion": "REGISTRAR_GASTO" | "REGISTRAR_INGRESO" | "CONSULTAR" | "CREAR_META_AHORRO" | "AGREGAR_A_META" | "OTRO",
  "confianza": 0.0-1.0
}`;

    const response = await this.sendMessage([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ], { temperature: 0.2, max_tokens: 100 });

    if (!response) return { intencion: 'OTRO', confianza: 0.5 };

    try {
      return JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
    } catch {
      return { intencion: 'OTRO', confianza: 0.5 };
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

    if (!response) return { error: true, sugerencia: 'No pude procesar el gasto.' };

    try {
      return JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
    } catch {
      return { error: true, sugerencia: 'No pude entender el gasto. ¿Puedes repetirlo?' };
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

    if (!response) return { error: true, sugerencia: 'No pude procesar el ingreso.' };

    try {
      return JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
    } catch {
      return { error: true, sugerencia: 'No pude entender el ingreso. ¿Puedes repetirlo?' };
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

Responde de forma clara, amigable y con montos bien formateados.
`;

    const response = await this.sendMessage([
      { role: 'system', content: systemPrompt },
      ...chatHistory.slice(-6),
      { role: 'user', content: userMessage }
    ], { temperature: 0.7, max_tokens: 500 });

    return response || 'No pude generar una respuesta en este momento.';
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

    return response || '¡Hola! 👋 Puedo ayudarte con tus finanzas 😊';
  }
  async classifySavingGoal(userMessage) {
  const systemPrompt = `
Extrae información para crear una META DE AHORRO.

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

  if (!response) return { error: true, sugerencia: 'No pude procesar la meta.' };

  try {
    return JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
  } catch {
    return {
      error: true,
      sugerencia: 'No entendí la meta. Ejemplo: "ahorrar 500 lucas para vacaciones"'
    };
  }
}
async classifySavingGoal(userMessage) {
  const systemPrompt = `
Extrae información para crear una META DE AHORRO.

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

  if (!response) return { error: true, sugerencia: 'No pude procesar la meta.' };

  try {
    return JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
  } catch {
    return {
      error: true,
      sugerencia: 'No entendí la meta. Ejemplo: "ahorrar 500 lucas para vacaciones"'
    };
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

  if (!response) return { error: true, sugerencia: 'No pude procesar el ahorro.' };

  try {
    return JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
  } catch {
    return {
      error: true,
      sugerencia: 'No entendí el ahorro. Ejemplo: "ahorré 50 lucas para el viaje"'
    };
  }
}


}

export default new OpenRouterService();
