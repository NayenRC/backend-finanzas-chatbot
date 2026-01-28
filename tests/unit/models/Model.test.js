/**
 * Pruebas Unitarias para la Clase Base Model
 */

import Model from '../../../src/models/Model.js';
import { getTestDb, setupDatabase, teardownDatabase } from '../../helpers/testDb.js';
import { createUserData } from '../../helpers/factories.js';

// Crear una clase modelo de prueba
class TestModel extends Model {
    static get tableName() {
        return 'usuario';
    }

    static get primaryKey() {
        return 'id_usuario';
    }
}

describe('Model Base Class', () => {
    beforeAll(async () => {
        await setupDatabase();
    });

    afterAll(async () => {
        await teardownDatabase();
    });

    beforeEach(async () => {
        const db = getTestDb();
        await db('usuario').truncate();
    });

    describe('tableName and primaryKey', () => {
        it('should throw error if tableName is not defined', () => {
            class InvalidModel extends Model { }
            expect(() => InvalidModel.tableName).toThrow('Debe definir static get tableName()');
        });

        it('should return correct tableName', () => {
            expect(TestModel.tableName).toBe('usuario');
        });

        it('should return correct primaryKey', () => {
            expect(TestModel.primaryKey).toBe('id_usuario');
        });

        it('should use default primaryKey if not overridden', () => {
            class DefaultModel extends Model {
                static get tableName() {
                    return 'test_table';
                }
            }
            expect(DefaultModel.primaryKey).toBe('id');
        });
    });

    describe('all()', () => {
        it('should return empty array when no records exist', async () => {
            const results = await TestModel.all();
            expect(results).toEqual([]);
        });

        it('should return all records', async () => {
            const db = getTestDb();

            // Insertar datos de prueba
            await db('usuario').insert([
                createUserData({ nombre: 'User 1' }),
                createUserData({ nombre: 'User 2' }),
                createUserData({ nombre: 'User 3' }),
            ]);

            const results = await TestModel.all();
            expect(results).toHaveLength(3);
            expect(results[0]).toHaveProperty('nombre');
        });
    });

    describe('find()', () => {
        it('should return null when record does not exist', async () => {
            const result = await TestModel.find(99999);
            expect(result).toBeUndefined();
        });

        it('should find record by primary key', async () => {
            const db = getTestDb();
            const userData = createUserData({ nombre: 'Find Test User' });
            const [inserted] = await db('usuario').insert(userData).returning('*');

            const result = await TestModel.find(inserted.id_usuario);
            expect(result).toBeDefined();
            expect(result.nombre).toBe('Find Test User');
            expect(result.id_usuario).toBe(inserted.id_usuario);
        });
    });

    describe('create()', () => {
        it('should create a new record', async () => {
            const userData = createUserData({ nombre: 'Created User' });
            const result = await TestModel.create(userData);

            expect(result).toBeDefined();
            expect(result.nombre).toBe('Created User');
            expect(result.id_usuario).toBeDefined();
        });

        it('should return the created record with all fields', async () => {
            const userData = createUserData({
                nombre: 'Full User',
                email: 'full@test.com',
            });
            const result = await TestModel.create(userData);

            expect(result.nombre).toBe('Full User');
            expect(result.email).toBe('full@test.com');
            expect(result.created_at).toBeDefined();
        });
    });

    describe('update()', () => {
        it('should update an existing record', async () => {
            const db = getTestDb();
            const userData = createUserData({ nombre: 'Original Name' });
            const [inserted] = await db('usuario').insert(userData).returning('*');

            const updated = await TestModel.update(inserted.id_usuario, {
                nombre: 'Updated Name'
            });

            expect(updated).toBeDefined();
            expect(updated.nombre).toBe('Updated Name');
            expect(updated.id_usuario).toBe(inserted.id_usuario);
        });

        it('should return undefined when updating non-existent record', async () => {
            const result = await TestModel.update(99999, { nombre: 'Ghost' });
            expect(result).toBeUndefined();
        });

        it('should only update specified fields', async () => {
            const db = getTestDb();
            const userData = createUserData({
                nombre: 'Original',
                email: 'original@test.com',
            });
            const [inserted] = await db('usuario').insert(userData).returning('*');

            const updated = await TestModel.update(inserted.id_usuario, {
                nombre: 'Updated Only Name'
            });

            expect(updated.nombre).toBe('Updated Only Name');
            expect(updated.email).toBe('original@test.com');
        });
    });

    describe('delete()', () => {
        it('should delete a record', async () => {
            const db = getTestDb();
            const userData = createUserData({ nombre: 'To Delete' });
            const [inserted] = await db('usuario').insert(userData).returning('*');

            const deleteCount = await TestModel.delete(inserted.id_usuario);
            expect(deleteCount).toBe(1);

            const found = await TestModel.find(inserted.id_usuario);
            expect(found).toBeUndefined();
        });

        it('should return 0 when deleting non-existent record', async () => {
            const deleteCount = await TestModel.delete(99999);
            expect(deleteCount).toBe(0);
        });
    });
});
