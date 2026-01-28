/**
 * Pruebas Unitarias para GastoController
 */

import { jest } from '@jest/globals';
import * as GastoController from '../../../src/controllers/GastoController.js';
import Gasto from '../../../src/models/Gasto.js';

// Mockear el modelo Gasto
jest.unstable_mockModule('../../../src/models/Gasto.js', () => ({
    default: {
        all: jest.fn(),
        find: jest.fn(),
        findByUser: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));

describe('GastoController', () => {
    let req, res;

    beforeEach(() => {
        // Reiniciar mocks
        jest.clearAllMocks();

        // Mockear objetos request y response
        req = {
            params: {},
            body: {},
            user: { id: 1 },
        };

        res = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
        };
    });

    describe('index()', () => {
        it('should return all gastos when no userId param', async () => {
            const mockGastos = [
                { id_gasto: 1, monto: 5000, descripcion: 'Test 1' },
                { id_gasto: 2, monto: 3000, descripcion: 'Test 2' },
            ];

            Gasto.all.mockResolvedValue(mockGastos);

            await GastoController.index(req, res);

            expect(Gasto.all).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(mockGastos);
        });

        it('should return gastos for specific user when userId param provided', async () => {
            const userId = 5;
            const mockUserGastos = [
                { id_gasto: 1, user_id: userId, monto: 5000 },
            ];

            req.params.userId = userId;
            Gasto.findByUser.mockResolvedValue(mockUserGastos);

            await GastoController.index(req, res);

            expect(Gasto.findByUser).toHaveBeenCalledWith(userId);
            expect(res.json).toHaveBeenCalledWith(mockUserGastos);
        });

        it('should handle errors', async () => {
            const error = new Error('Database error');
            Gasto.all.mockRejectedValue(error);

            await GastoController.index(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });

    describe('show()', () => {
        it('should return a gasto by id', async () => {
            const mockGasto = { id_gasto: 1, monto: 5000, descripcion: 'Test' };
            req.params.id = 1;

            Gasto.find.mockResolvedValue(mockGasto);

            await GastoController.show(req, res);

            expect(Gasto.find).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith(mockGasto);
        });

        it('should return 404 when gasto not found', async () => {
            req.params.id = 999;
            Gasto.find.mockResolvedValue(null);

            await GastoController.show(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Gasto no encontrado' });
        });

        it('should handle errors', async () => {
            req.params.id = 1;
            const error = new Error('Database error');
            Gasto.find.mockRejectedValue(error);

            await GastoController.show(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });

    describe('store()', () => {
        it('should create a new gasto', async () => {
            const gastoData = {
                monto: 5000,
                descripcion: 'Almuerzo',
                fecha: '2024-01-15',
            };

            const createdGasto = {
                id_gasto: 1,
                user_id: 1,
                ...gastoData,
            };

            req.body = gastoData;
            Gasto.create.mockResolvedValue(createdGasto);

            await GastoController.store(req, res);

            expect(Gasto.create).toHaveBeenCalledWith({
                ...gastoData,
                user_id: 1,
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(createdGasto);
        });

        it('should use user_id from req.user when available', async () => {
            req.body = {
                monto: 5000,
                descripcion: 'Test',
                fecha: '2024-01-15',
            };
            req.user = { id: 42 };

            Gasto.create.mockResolvedValue({ id_gasto: 1 });

            await GastoController.store(req, res);

            expect(Gasto.create).toHaveBeenCalledWith(
                expect.objectContaining({ user_id: 42 })
            );
        });

        it('should return 400 when required fields are missing', async () => {
            req.body = { descripcion: 'Incomplete' }; // Faltan monto y fecha

            await GastoController.store(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Faltan campos obligatorios (user_id, monto o fecha)',
            });
            expect(Gasto.create).not.toHaveBeenCalled();
        });

        it('should handle errors', async () => {
            req.body = {
                user_id: 1,
                monto: 5000,
                fecha: '2024-01-15',
            };

            const error = new Error('Database error');
            Gasto.create.mockRejectedValue(error);

            await GastoController.store(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });

    describe('update()', () => {
        it('should update a gasto', async () => {
            const updatedGasto = {
                id_gasto: 1,
                monto: 7500,
                descripcion: 'Updated',
            };

            req.params.id = 1;
            req.body = { monto: 7500, descripcion: 'Updated' };

            Gasto.update.mockResolvedValue(updatedGasto);

            await GastoController.update(req, res);

            expect(Gasto.update).toHaveBeenCalledWith(1, req.body);
            expect(res.json).toHaveBeenCalledWith(updatedGasto);
        });

        it('should return 404 when gasto not found', async () => {
            req.params.id = 999;
            req.body = { monto: 5000 };

            Gasto.update.mockResolvedValue(null);

            await GastoController.update(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Gasto no encontrado' });
        });

        it('should handle errors', async () => {
            req.params.id = 1;
            req.body = { monto: 5000 };

            const error = new Error('Database error');
            Gasto.update.mockRejectedValue(error);

            await GastoController.update(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });

    describe('destroy()', () => {
        it('should delete a gasto', async () => {
            req.params.id = 1;
            Gasto.delete.mockResolvedValue(1);

            await GastoController.destroy(req, res);

            expect(Gasto.delete).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Gasto eliminado correctamente',
            });
        });

        it('should handle errors', async () => {
            req.params.id = 1;
            const error = new Error('Database error');
            Gasto.delete.mockRejectedValue(error);

            await GastoController.destroy(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });
});
