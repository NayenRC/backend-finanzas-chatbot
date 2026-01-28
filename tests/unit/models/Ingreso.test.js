/**
 * Pruebas Unitarias para el Modelo Ingreso
 */

import Ingreso from '../../../src/models/Ingreso.js';
import { getTestDb, setupDatabase, teardownDatabase } from '../../helpers/testDb.js';
import { createUserData, createIngresoData, createMultipleIngresos } from '../../helpers/factories.js';

describe('Ingreso Model', () => {
    let testUserId;

    beforeAll(async () => {
        await setupDatabase();
    });

    afterAll(async () => {
        await teardownDatabase();
    });

    beforeEach(async () => {
        const db = getTestDb();
        await db('ingreso').truncate();
        await db('usuario').truncate();

        // Create a test user
        const userData = createUserData();
        const [user] = await db('usuario').insert(userData).returning('*');
        testUserId = user.id_usuario;
    });

    describe('Model Configuration', () => {
        it('should have correct tableName', () => {
            expect(Ingreso.tableName).toBe('ingreso');
        });

        it('should have correct primaryKey', () => {
            expect(Ingreso.primaryKey).toBe('id_ingreso');
        });
    });

    describe('CRUD Operations', () => {
        it('should create a new ingreso', async () => {
            const ingresoData = createIngresoData(testUserId, {
                monto: 50000,
                descripcion: 'Salario mensual',
            });

            const ingreso = await Ingreso.create(ingresoData);

            expect(ingreso).toBeDefined();
            expect(ingreso.id_ingreso).toBeDefined();
            expect(ingreso.monto).toBe('50000');
            expect(ingreso.descripcion).toBe('Salario mensual');
            expect(ingreso.user_id).toBe(testUserId);
        });

        it('should find an ingreso by id', async () => {
            const db = getTestDb();
            const ingresoData = createIngresoData(testUserId);
            const [inserted] = await db('ingreso').insert(ingresoData).returning('*');

            const found = await Ingreso.find(inserted.id_ingreso);

            expect(found).toBeDefined();
            expect(found.id_ingreso).toBe(inserted.id_ingreso);
        });

        it('should update an ingreso', async () => {
            const db = getTestDb();
            const ingresoData = createIngresoData(testUserId, { monto: 50000 });
            const [inserted] = await db('ingreso').insert(ingresoData).returning('*');

            const updated = await Ingreso.update(inserted.id_ingreso, { monto: 55000 });

            expect(updated.monto).toBe('55000');
        });

        it('should delete an ingreso', async () => {
            const db = getTestDb();
            const ingresoData = createIngresoData(testUserId);
            const [inserted] = await db('ingreso').insert(ingresoData).returning('*');

            const deleteCount = await Ingreso.delete(inserted.id_ingreso);
            expect(deleteCount).toBe(1);

            const found = await Ingreso.find(inserted.id_ingreso);
            expect(found).toBeUndefined();
        });

        it('should get all ingresos', async () => {
            const db = getTestDb();
            const ingresosData = createMultipleIngresos(testUserId, 3);
            await db('ingreso').insert(ingresosData);

            const ingresos = await Ingreso.all();

            expect(ingresos).toHaveLength(3);
        });
    });

    describe('findByUser()', () => {
        it('should return empty array when user has no ingresos', async () => {
            const ingresos = await Ingreso.findByUser(testUserId);
            expect(ingresos).toEqual([]);
        });

        it('should return all ingresos for a specific user', async () => {
            const db = getTestDb();

            // Create another user
            const user2Data = createUserData();
            const [user2] = await db('usuario').insert(user2Data).returning('*');

            // Create ingresos for both users
            await db('ingreso').insert(createMultipleIngresos(testUserId, 3));
            await db('ingreso').insert(createMultipleIngresos(user2.id_usuario, 2));

            const user1Ingresos = await Ingreso.findByUser(testUserId);
            const user2Ingresos = await Ingreso.findByUser(user2.id_usuario);

            expect(user1Ingresos).toHaveLength(3);
            expect(user2Ingresos).toHaveLength(2);

            // Verify all returned ingresos belong to the correct user
            user1Ingresos.forEach(ingreso => {
                expect(ingreso.user_id).toBe(testUserId);
            });
        });

        it('should return ingresos ordered by fecha desc', async () => {
            const db = getTestDb();

            // Create ingresos with different dates
            await db('ingreso').insert([
                createIngresoData(testUserId, { fecha: '2024-01-01', descripcion: 'Oldest' }),
                createIngresoData(testUserId, { fecha: '2024-01-15', descripcion: 'Middle' }),
                createIngresoData(testUserId, { fecha: '2024-01-30', descripcion: 'Newest' }),
            ]);

            const ingresos = await Ingreso.findByUser(testUserId);

            expect(ingresos[0].descripcion).toBe('Newest');
            expect(ingresos[1].descripcion).toBe('Middle');
            expect(ingresos[2].descripcion).toBe('Oldest');
        });
    });

    describe('Data Validation', () => {
        it('should handle large amounts correctly', async () => {
            const ingresoData = createIngresoData(testUserId, { monto: 1000000 });
            const ingreso = await Ingreso.create(ingresoData);

            expect(parseFloat(ingreso.monto)).toBe(1000000);
        });

        it('should store categoria correctly', async () => {
            const categories = ['Salario', 'Freelance', 'Inversiones', 'Otros'];

            for (const categoria of categories) {
                const ingresoData = createIngresoData(testUserId, { categoria });
                const ingreso = await Ingreso.create(ingresoData);
                expect(ingreso.categoria).toBe(categoria);
            }
        });
    });
});
