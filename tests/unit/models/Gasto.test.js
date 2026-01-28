/**
 * Pruebas Unitarias para el Modelo Gasto
 */

import Gasto from '../../../src/models/Gasto.js';
import { getTestDb, setupDatabase, teardownDatabase } from '../../helpers/testDb.js';
import { createUserData, createGastoData, createMultipleGastos } from '../../helpers/factories.js';

describe('Gasto Model', () => {
    let testUserId;

    beforeAll(async () => {
        await setupDatabase();
    });

    afterAll(async () => {
        await teardownDatabase();
    });

    beforeEach(async () => {
        const db = getTestDb();
        await db('gasto').truncate();
        await db('usuario').truncate();

        // Create a test user
        const userData = createUserData();
        const [user] = await db('usuario').insert(userData).returning('*');
        testUserId = user.id_usuario;
    });

    describe('Model Configuration', () => {
        it('should have correct tableName', () => {
            expect(Gasto.tableName).toBe('gasto');
        });

        it('should have correct primaryKey', () => {
            expect(Gasto.primaryKey).toBe('id_gasto');
        });
    });

    describe('CRUD Operations', () => {
        it('should create a new gasto', async () => {
            const gastoData = createGastoData(testUserId, {
                monto: 1200000,
                descripcion: 'Almuerzo en restaurante',
                categoria: 'Comida',
            });

            const gasto = await Gasto.create(gastoData);

            expect(gasto).toBeDefined();
            expect(gasto.id_gasto).toBeDefined();
            expect(gasto.monto).toBe('1200000');
            expect(gasto.descripcion).toBe('Almuerzo en restaurante');
            expect(gasto.categoria).toBe('Comida');
            expect(gasto.user_id).toBe(testUserId);
        });

        it('should find a gasto by id', async () => {
            const db = getTestDb();
            const gastoData = createGastoData(testUserId);
            const [inserted] = await db('gasto').insert(gastoData).returning('*');

            const found = await Gasto.find(inserted.id_gasto);

            expect(found).toBeDefined();
            expect(found.id_gasto).toBe(inserted.id_gasto);
        });

        it('should update a gasto', async () => {
            const db = getTestDb();
            const gastoData = createGastoData(testUserId, { monto: 5000 });
            const [inserted] = await db('gasto').insert(gastoData).returning('*');

            const updated = await Gasto.update(inserted.id_gasto, { monto: 7500 });

            expect(updated.monto).toBe('7500');
        });

        it('should delete a gasto', async () => {
            const db = getTestDb();
            const gastoData = createGastoData(testUserId);
            const [inserted] = await db('gasto').insert(gastoData).returning('*');

            const deleteCount = await Gasto.delete(inserted.id_gasto);
            expect(deleteCount).toBe(1);

            const found = await Gasto.find(inserted.id_gasto);
            expect(found).toBeUndefined();
        });

        it('should get all gastos', async () => {
            const db = getTestDb();
            const gastosData = createMultipleGastos(testUserId, 3);
            await db('gasto').insert(gastosData);

            const gastos = await Gasto.all();

            expect(gastos).toHaveLength(3);
        });
    });

    describe('findByUser()', () => {
        it('should return empty array when user has no gastos', async () => {
            const gastos = await Gasto.findByUser(testUserId);
            expect(gastos).toEqual([]);
        });

        it('should return all gastos for a specific user', async () => {
            const db = getTestDb();

            // Create another user
            const user2Data = createUserData();
            const [user2] = await db('usuario').insert(user2Data).returning('*');

            // Create gastos for both users
            await db('gasto').insert(createMultipleGastos(testUserId, 3));
            await db('gasto').insert(createMultipleGastos(user2.id_usuario, 2));

            const user1Gastos = await Gasto.findByUser(testUserId);
            const user2Gastos = await Gasto.findByUser(user2.id_usuario);

            expect(user1Gastos).toHaveLength(3);
            expect(user2Gastos).toHaveLength(2);

            // Verify all returned gastos belong to the correct user
            user1Gastos.forEach(gasto => {
                expect(gasto.user_id).toBe(testUserId);
            });
        });

        it('should return gastos ordered by fecha desc', async () => {
            const db = getTestDb();

            // Create gastos with different dates
            await db('gasto').insert([
                createGastoData(testUserId, { fecha: '2024-01-01', descripcion: 'Oldest' }),
                createGastoData(testUserId, { fecha: '2024-01-15', descripcion: 'Middle' }),
                createGastoData(testUserId, { fecha: '2024-01-30', descripcion: 'Newest' }),
            ]);

            const gastos = await Gasto.findByUser(testUserId);

            expect(gastos[0].descripcion).toBe('Newest');
            expect(gastos[1].descripcion).toBe('Middle');
            expect(gastos[2].descripcion).toBe('Oldest');
        });
    });

    describe('Data Validation', () => {
        it('should handle decimal amounts correctly', async () => {
            const gastoData = createGastoData(testUserId, { monto: 1234.56 });
            const gasto = await Gasto.create(gastoData);

            expect(parseFloat(gasto.monto)).toBeCloseTo(1234.56, 2);
        });

        it('should store categoria correctly', async () => {
            const categories = ['Comida', 'Salud', 'Transporte', 'Hogar'];

            for (const categoria of categories) {
                const gastoData = createGastoData(testUserId, { categoria });
                const gasto = await Gasto.create(gastoData);
                expect(gasto.categoria).toBe(categoria);
            }
        });
    });
});
