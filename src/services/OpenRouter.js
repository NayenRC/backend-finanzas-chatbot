/**
 * Servicio OpenRouter
 *
 * Gestiona la integración con la API de OpenRouter (AI).
 * Documentación API: https://openrouter.ai/docs
 */

import 'dotenv/config';

class OpenRouterService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.baseUrl = 'https://openrouter.ai/api/v1';

    if (!this.apiKey) {
      console.warn('ADVERTENCIA: OPENROUTER_API_KEY no está definida en .env');
    }
  }

  /**
   * Genera un resumen de un texto usando un modelo LLM.
   * @param {string} text - Texto a resumir
   * @returns {Promise<string>} - El resumen generado
   */
  async generateSummary(text) {
    if (!this.apiKey) {
      return 'Simulación: No hay API Key configurada. Este es un resumen simulado.';
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          // Header opcional para identificar tu app en OpenRouter rankings
          // 'HTTP-Referer': 'https://tu-sitio.com',
          // 'X-Title': 'Backend Edu Project',
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo', // O cualquier otro modelo disponible en OpenRouter
          messages: [
            {
              role: 'system',
              content:
                'Eres un asistente experto en resumir textos de forma concisa.',
            },
            {
              role: 'user',
              content: `Resume el siguiente texto:\n\n${text}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `OpenRouter API Error: ${response.status} - ${errorBody}`,
        );
      }

      const data = await response.json();
      const summary = data.choices[0].message.content;
      return summary;
    } catch (error) {
      console.error('Error llamando a OpenRouter:', error);
      throw error;
    }
  }
}

export default new OpenRouterService();
