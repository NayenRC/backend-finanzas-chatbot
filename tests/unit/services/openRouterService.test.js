/**
 * Pruebas Unitarias para el Servicio OpenRouter
 */

import { jest } from '@jest/globals';
import axios from 'axios';

// Mockear axios
jest.mock('axios');

// Importar después de mockear
const openRouterService = (await import('../../../src/services/openRouterService.js')).default;

describe('OpenRouter Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('sendMessage()', () => {
        it('should send a message and return AI response', async () => {
            const mockResponse = {
                data: {
                    choices: [
                        {
                            message: {
                                content: 'This is the AI response',
                            },
                        },
                    ],
                },
            };

            axios.post.mockResolvedValue(mockResponse);

            const messages = [
                { role: 'user', content: 'Hello AI' },
            ];

            const result = await openRouterService.sendMessage(messages);

            expect(result).toBe('This is the AI response');
            expect(axios.post).toHaveBeenCalledWith(
                'https://openrouter.ai/api/v1/chat/completions',
                expect.objectContaining({
                    model: 'openai/gpt-4o-mini',
                    messages,
                }),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': expect.stringContaining('Bearer'),
                        'Content-Type': 'application/json',
                    }),
                })
            );
        });

        it('should use custom options when provided', async () => {
            const mockResponse = {
                data: {
                    choices: [{ message: { content: 'Response' } }],
                },
            };

            axios.post.mockResolvedValue(mockResponse);

            const messages = [{ role: 'user', content: 'Test' }];
            const options = {
                model: 'openai/gpt-4',
                temperature: 0.5,
                max_tokens: 500,
            };

            await openRouterService.sendMessage(messages, options);

            expect(axios.post).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    model: 'openai/gpt-4',
                    temperature: 0.5,
                    max_tokens: 500,
                }),
                expect.any(Object)
            );
        });

        it('should handle API errors', async () => {
            const error = {
                response: {
                    data: { error: 'API Error' },
                },
            };

            axios.post.mockRejectedValue(error);

            const messages = [{ role: 'user', content: 'Test' }];

            await expect(openRouterService.sendMessage(messages)).rejects.toThrow(
                'Error al comunicarse con la IA'
            );
        });
    });

    describe('analyzeIntent()', () => {
        it('should identify REGISTRAR_GASTO intent', async () => {
            const mockResponse = {
                data: {
                    choices: [
                        {
                            message: {
                                content: '{"intencion": "REGISTRAR_GASTO", "confianza": 0.95}',
                            },
                        },
                    ],
                },
            };

            axios.post.mockResolvedValue(mockResponse);

            const result = await openRouterService.analyzeIntent('gasté 5000 en almuerzo');

            expect(result.intencion).toBe('REGISTRAR_GASTO');
            expect(result.confianza).toBe(0.95);
        });

        it('should identify REGISTRAR_INGRESO intent', async () => {
            const mockResponse = {
                data: {
                    choices: [
                        {
                            message: {
                                content: '{"intencion": "REGISTRAR_INGRESO", "confianza": 0.9}',
                            },
                        },
                    ],
                },
            };

            axios.post.mockResolvedValue(mockResponse);

            const result = await openRouterService.analyzeIntent('recibí 50000 de sueldo');

            expect(result.intencion).toBe('REGISTRAR_INGRESO');
            expect(result.confianza).toBe(0.9);
        });

        it('should identify CONSULTAR intent', async () => {
            const mockResponse = {
                data: {
                    choices: [
                        {
                            message: {
                                content: '{"intencion": "CONSULTAR", "confianza": 0.88}',
                            },
                        },
                    ],
                },
            };

            axios.post.mockResolvedValue(mockResponse);

            const result = await openRouterService.analyzeIntent('¿cuánto gasté esta semana?');

            expect(result.intencion).toBe('CONSULTAR');
        });

        it('should return OTRO for unrecognized intents', async () => {
            const mockResponse = {
                data: {
                    choices: [
                        {
                            message: {
                                content: 'Invalid response',
                            },
                        },
                    ],
                },
            };

            axios.post.mockResolvedValue(mockResponse);

            const result = await openRouterService.analyzeIntent('random text');

            expect(result.intencion).toBe('OTRO');
            expect(result.confianza).toBe(0.5);
        });

        it('should handle errors gracefully', async () => {
            axios.post.mockRejectedValue(new Error('Network error'));

            const result = await openRouterService.analyzeIntent('test message');

            expect(result.intencion).toBe('OTRO');
            expect(result.confianza).toBe(0.5);
        });
    });

    describe('classifyExpense()', () => {
        it('should extract expense data from natural language', async () => {
            const mockResponse = {
                data: {
                    choices: [
                        {
                            message: {
                                content: JSON.stringify({
                                    tipo: 'GASTO',
                                    monto: 5000,
                                    descripcion: 'almuerzo',
                                    categoria: 'Alimentación',
                                    confianza: 0.95,
                                }),
                            },
                        },
                    ],
                },
            };

            axios.post.mockResolvedValue(mockResponse);

            const result = await openRouterService.classifyExpense('gasté 5000 en almuerzo');

            expect(result.tipo).toBe('GASTO');
            expect(result.monto).toBe(5000);
            expect(result.descripcion).toBe('almuerzo');
            expect(result.categoria).toBe('Alimentación');
        });

        it('should extract income data from natural language', async () => {
            const mockResponse = {
                data: {
                    choices: [
                        {
                            message: {
                                content: JSON.stringify({
                                    tipo: 'INGRESO',
                                    monto: 50000,
                                    descripcion: 'salario',
                                    categoria: 'Salario',
                                    confianza: 0.9,
                                }),
                            },
                        },
                    ],
                },
            };

            axios.post.mockResolvedValue(mockResponse);

            const result = await openRouterService.classifyExpense('recibí 50000 de salario');

            expect(result.tipo).toBe('INGRESO');
            expect(result.monto).toBe(50000);
        });

        it('should return error when unable to parse message', async () => {
            const mockResponse = {
                data: {
                    choices: [
                        {
                            message: {
                                content: 'Invalid response without JSON',
                            },
                        },
                    ],
                },
            };

            axios.post.mockResolvedValue(mockResponse);

            const result = await openRouterService.classifyExpense('unclear message');

            expect(result.error).toBeDefined();
        });

        it('should handle API errors', async () => {
            axios.post.mockRejectedValue(new Error('API Error'));

            const result = await openRouterService.classifyExpense('test message');

        });

        describe('generateQueryResponse()', () => {
            it('should generate a natural language response', async () => {
                const mockResponse = {
                    data: {
                        choices: [
                            {
                                message: {
                                    content: `📊 **Reporte de Gastos - Ene 2025** 📊

**Total Gastado: $2.300.000**

**Desglose por Categoría:**

1. 🍔 **Comida**
   Total: $1.200.000
   Transacciones: 15

2. 🏥 **Salud**
   Total: $800.000
   Transacciones: 5

3. 🚗 **Transporte**
   Total: $300.000
   Transacciones: 10

4. 🏠 **Hogar**
   Total: $200.000
   Transacciones: 2

💡 **Consejo:** Tu gasto en Comida es el 52% del total. ¡Intenta reducirlo el próximo mes!

📅 **Ver Mes Anterior**
📊 **Gráfico de Torta**`,
                                },
                            },
                        ],
                    },
                };

                axios.post.mockResolvedValue(mockResponse);

                const expenseData = {
                    totalGastado: 2300000,
                    desglosePorCategoria: [
                        { categoria: 'Comida', total: 1200000, transacciones: 15 },
                        { categoria: 'Salud', total: 800000, transacciones: 5 },
                        { categoria: 'Transporte', total: 300000, transacciones: 10 },
                        { categoria: 'Hogar', total: 200000, transacciones: 2 },
                    ]
                };

                const result = await openRouterService.generateQueryResponse(
                    '¿cuánto gasté este mes?',
                    expenseData
                );

                expect(result).toContain('Reporte de Gastos');
                expect(result).toContain('$2.300.000');
                expect(result).toContain('Comida');
                expect(result).toContain('$1.200.000');
            });

            it('should include chat history in context', async () => {
                const mockResponse = {
                    data: {
                        choices: [{ message: { content: 'Response' } }],
                    },
                };

                axios.post.mockResolvedValue(mockResponse);

                const chatHistory = [
                    { role: 'user', content: 'Previous question' },
                    { role: 'assistant', content: 'Previous answer' },
                ];

                await openRouterService.generateQueryResponse(
                    'Follow-up question',
                    {},
                    chatHistory
                );

                expect(axios.post).toHaveBeenCalledWith(
                    expect.any(String),
                    expect.objectContaining({
                        messages: expect.arrayContaining([
                            expect.objectContaining({ content: 'Previous question' }),
                            expect.objectContaining({ content: 'Follow-up question' }),
                        ]),
                    }),
                    expect.any(Object)
                );
            });

            it('should handle errors gracefully', async () => {
                axios.post.mockRejectedValue(new Error('API Error'));

                const result = await openRouterService.generateQueryResponse('test', {});

                expect(result).toContain('Lo siento');
            });
        });

        describe('generateGeneralResponse()', () => {
            it('should generate a friendly greeting', async () => {
                const mockResponse = {
                    data: {
                        choices: [
                            {
                                message: {
                                    content: '¡Hola! 👋 ¿En qué puedo ayudarte hoy?',
                                },
                            },
                        ],
                    },
                };

                axios.post.mockResolvedValue(mockResponse);

                const result = await openRouterService.generateGeneralResponse('hola');

                expect(result).toContain('Hola');
            });

            it('should handle errors with default greeting', async () => {
                axios.post.mockRejectedValue(new Error('API Error'));

                const result = await openRouterService.generateGeneralResponse('hola');

                expect(result).toContain('SmartFin');
                expect(result).toContain('asistente financiero');
            });
        });
    });
});
