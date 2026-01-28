/**
 * Pruebas de Integración para Rutas de Finanzas
 */

import request from 'supertest';
import express from 'express';
import finanzasRoutes from '../../../src/routes/finanzas.routes.js';

// Crear aplicación de prueba
const app = express();
app.use(express.json());
app.use(finanzasRoutes);

describe('Finanzas Routes Integration Tests', () => {
    describe('POST /gastos', () => {
        it('should create a new gasto with valid data', async () => {
            const gastoData = {
                monto: 5000,
                descripcion: 'Almuerzo',
                fecha: '2024-01-15',
            };

            const response = await request(app)
                .post('/gastos')
                .send(gastoData)
                .expect(200);

            expect(response.body).toEqual({
                ok: true,
                tipo: 'gasto',
                monto: 5000,
                descripcion: 'Almuerzo',
                fecha: '2024-01-15',
            });
        });

        it('should return 400 when monto is missing', async () => {
            const invalidData = {
                descripcion: 'Incomplete',
            };

            const response = await request(app)
                .post('/gastos')
                .send(invalidData)
                .expect(400);

            expect(response.body).toEqual({
                error: 'Datos incompletos',
            });
        });

        it('should return 400 when descripcion is missing', async () => {
            const invalidData = {
                monto: 5000,
            };

            const response = await request(app)
                .post('/gastos')
                .send(invalidData)
                .expect(400);

            expect(response.body).toEqual({
                error: 'Datos incompletos',
            });
        });

        it('should accept gasto without fecha', async () => {
            const gastoData = {
                monto: 3000,
                descripcion: 'Café',
            };

            const response = await request(app)
                .post('/gastos')
                .send(gastoData)
                .expect(200);

            expect(response.body.ok).toBe(true);
            expect(response.body.tipo).toBe('gasto');
        });
    });

    describe('POST /ingresos', () => {
        it('should create a new ingreso with valid data', async () => {
            const ingresoData = {
                monto: 50000,
                descripcion: 'Salario',
                fecha: '2024-01-01',
            };

            const response = await request(app)
                .post('/ingresos')
                .send(ingresoData)
                .expect(200);

            expect(response.body).toEqual({
                ok: true,
                tipo: 'ingreso',
                monto: 50000,
                descripcion: 'Salario',
                fecha: '2024-01-01',
            });
        });

        it('should return 400 when monto is missing', async () => {
            const invalidData = {
                descripcion: 'Incomplete',
            };

            const response = await request(app)
                .post('/ingresos')
                .send(invalidData)
                .expect(400);

            expect(response.body).toEqual({
                error: 'Datos incompletos',
            });
        });

        it('should return 400 when descripcion is missing', async () => {
            const invalidData = {
                monto: 50000,
            };

            const response = await request(app)
                .post('/ingresos')
                .send(invalidData)
                .expect(400);

            expect(response.body).toEqual({
                error: 'Datos incompletos',
            });
        });

        it('should accept ingreso without fecha', async () => {
            const ingresoData = {
                monto: 10000,
                descripcion: 'Freelance',
            };

            const response = await request(app)
                .post('/ingresos')
                .send(ingresoData)
                .expect(200);

            expect(response.body.ok).toBe(true);
            expect(response.body.tipo).toBe('ingreso');
        });
    });

    describe('Data Types', () => {
        it('should handle numeric monto as number', async () => {
            const response = await request(app)
                .post('/gastos')
                .send({
                    monto: 1234.56,
                    descripcion: 'Test',
                })
                .expect(200);

            expect(response.body.monto).toBe(1234.56);
        });

        it('should handle numeric monto as string', async () => {
            const response = await request(app)
                .post('/gastos')
                .send({
                    monto: '5000',
                    descripcion: 'Test',
                })
                .expect(200);

            expect(response.body.monto).toBe('5000');
        });

        it('should handle large amounts', async () => {
            const response = await request(app)
                .post('/ingresos')
                .send({
                    monto: 1000000,
                    descripcion: 'Bonus',
                })
                .expect(200);

            expect(response.body.monto).toBe(1000000);
        });
    });

    describe('Content-Type', () => {
        it('should accept application/json', async () => {
            const response = await request(app)
                .post('/gastos')
                .set('Content-Type', 'application/json')
                .send({
                    monto: 5000,
                    descripcion: 'Test',
                })
                .expect(200);

            expect(response.body.ok).toBe(true);
        });

        it('should reject invalid JSON', async () => {
            const response = await request(app)
                .post('/gastos')
                .set('Content-Type', 'application/json')
                .send('invalid json')
                .expect(400);
        });
    });
});
