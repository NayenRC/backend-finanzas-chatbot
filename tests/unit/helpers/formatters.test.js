/**
 * Pruebas para utilidades de formateo de respuestas del bot
 */

import {
    formatearReporteGastos,
    formatearConfirmacionGasto,
    formatearConfirmacionIngreso,
    formatearBienvenida,
    calcularPorcentaje,
    generarConsejo,
} from '../../helpers/formatters.js';

describe('Formatters', () => {
    describe('formatearReporteGastos()', () => {
        it('should format expense report like Telegram bot', () => {
            const datos = {
                titulo: 'Reporte de Gastos - Ene 2025',
                totalGastado: 2300000,
                desglosePorCategoria: [
                    { categoria: 'Comida', total: 1200000, transacciones: 15 },
                    { categoria: 'Salud', total: 800000, transacciones: 5 },
                    { categoria: 'Transporte', total: 300000, transacciones: 10 },
                    { categoria: 'Hogar', total: 200000, transacciones: 2 },
                ],
                consejo: 'Tu gasto en Comida es el 52% del total. ¡Intenta reducirlo el próximo mes!',
            };

            const resultado = formatearReporteGastos(datos);

            expect(resultado).toContain('📊');
            expect(resultado).toContain('Reporte de Gastos - Ene 2025');
            expect(resultado).toContain('$2.300.000');
            expect(resultado).toContain('🍔 **Comida**');
            expect(resultado).toContain('$1.200.000');
            expect(resultado).toContain('Transacciones: 15');
            expect(resultado).toContain('💡 **Consejo:**');
            expect(resultado).toContain('📅 **Ver Mes Anterior**');
            expect(resultado).toContain('📊 **Gráfico de Torta**');
        });

        it('should format report without consejo', () => {
            const datos = {
                titulo: 'Reporte Simple',
                totalGastado: 100000,
                desglosePorCategoria: [
                    { categoria: 'Comida', total: 100000, transacciones: 5 },
                ],
            };

            const resultado = formatearReporteGastos(datos);

            expect(resultado).toContain('Reporte Simple');
            expect(resultado).not.toContain('💡 **Consejo:**');
        });
    });

    describe('formatearConfirmacionGasto()', () => {
        it('should format expense confirmation', () => {
            const gasto = {
                descripcion: 'Almuerzo en restaurante',
                monto: 1200000,
                categoria: 'Comida',
                fecha: '2025-01-15',
            };

            const resultado = formatearConfirmacionGasto(gasto);

            expect(resultado).toContain('✅ **Gasto Registrado**');
            expect(resultado).toContain('🍔');
            expect(resultado).toContain('Almuerzo en restaurante');
            expect(resultado).toContain('$1.200.000');
            expect(resultado).toContain('Comida');
            expect(resultado).toContain('2025-01-15');
        });

        it('should use default emoji for unknown category', () => {
            const gasto = {
                descripcion: 'Gasto varios',
                monto: 50000,
                categoria: 'Otros',
                fecha: '2025-01-15',
            };

            const resultado = formatearConfirmacionGasto(gasto);

            expect(resultado).toContain('💰');
        });
    });

    describe('formatearConfirmacionIngreso()', () => {
        it('should format income confirmation', () => {
            const ingreso = {
                descripcion: 'Sueldo mensual',
                monto: 2500000,
                categoria: 'Salario',
                fecha: '2025-01-01',
            };

            const resultado = formatearConfirmacionIngreso(ingreso);

            expect(resultado).toContain('✅ **Ingreso Registrado**');
            expect(resultado).toContain('$2.500.000');
            expect(resultado).toContain('Sueldo mensual');
            expect(resultado).toContain('Salario');
        });
    });

    describe('formatearBienvenida()', () => {
        it('should format welcome message', () => {
            const resultado = formatearBienvenida();

            expect(resultado).toContain('¡Hola! 👋');
            expect(resultado).toContain('SmartFin');
            expect(resultado).toContain('asistente financiero');
            expect(resultado).toContain('💰 Registrar gastos e ingresos');
            expect(resultado).toContain('📊 Consultar tus finanzas');
        });
    });

    describe('calcularPorcentaje()', () => {
        it('should calculate percentage correctly', () => {
            expect(calcularPorcentaje(1200000, 2300000)).toBe(52);
            expect(calcularPorcentaje(800000, 2300000)).toBe(35);
            expect(calcularPorcentaje(300000, 2300000)).toBe(13);
        });

        it('should handle zero total', () => {
            expect(calcularPorcentaje(100, 0)).toBeNaN();
        });
    });

    describe('generarConsejo()', () => {
        it('should generate advice for high percentage category', () => {
            const desglose = [
                { categoria: 'Comida', total: 1200000, transacciones: 15 },
                { categoria: 'Salud', total: 800000, transacciones: 5 },
            ];

            const consejo = generarConsejo(desglose, 2000000);

            expect(consejo).toContain('Comida');
            expect(consejo).toContain('60%');
            expect(consejo).toContain('reducirlo');
        });

        it('should generate advice for medium percentage category', () => {
            const desglose = [
                { categoria: 'Comida', total: 700000, transacciones: 10 },
                { categoria: 'Salud', total: 300000, transacciones: 5 },
            ];

            const consejo = generarConsejo(desglose, 2000000);

            expect(consejo).toContain('Comida');
            expect(consejo).toContain('35%');
            expect(consejo).toContain('optimizar');
        });

        it('should generate positive advice for balanced expenses', () => {
            const desglose = [
                { categoria: 'Comida', total: 500000, transacciones: 10 },
                { categoria: 'Salud', total: 400000, transacciones: 5 },
                { categoria: 'Transporte', total: 300000, transacciones: 8 },
            ];

            const consejo = generarConsejo(desglose, 2000000);

            expect(consejo).toContain('bien distribuidos');
            expect(consejo).toContain('👍');
        });

        it('should return null for empty categories', () => {
            const consejo = generarConsejo([], 0);
            expect(consejo).toBeNull();
        });
    });
});
