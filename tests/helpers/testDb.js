/**
 * Utilidades de Base de Datos para Pruebas
 * 
 * Proporciona funciones auxiliares para gestionar la base de datos de prueba:
 * - Crear/destruir conexiones
 * - Ejecutar migraciones
 * - Limpiar datos entre pruebas
 */

import knex from 'knex';
import knexConfig from '../../knexfile.js';

let testDb = null;

/**
 * Obtener o crear conexión a la base de datos de prueba
 */
export function getTestDb() {
    if (!testDb) {
        const config = knexConfig[process.env.NODE_ENV || 'test'];
        testDb = knex(config);
    }
    return testDb;
}

/**
 * Ejecutar migraciones en la base de datos de prueba
 */
export async function runMigrations() {
    const db = getTestDb();
    await db.migrate.latest();
}

/**
 * Revertir todas las migraciones
 */
export async function rollbackMigrations() {
    const db = getTestDb();
    await db.migrate.rollback(undefined, true);
}

/**
 * Limpiar todos los datos de las tablas (excepto migraciones)
 */
export async function cleanDatabase() {
    const db = getTestDb();

    // Obtener nombres de todas las tablas
    const tables = await db('information_schema.tables')
        .select('table_name')
        .where('table_schema', 'public')
        .whereNot('table_name', 'knex_migrations')
        .whereNot('table_name', 'knex_migrations_lock');

    // Deshabilitar verificaciones de claves foráneas temporalmente
    await db.raw('SET session_replication_role = replica;');

    // Truncar todas las tablas
    for (const { table_name } of tables) {
        await db(table_name).truncate();
    }

    // Re-habilitar verificaciones de claves foráneas
    await db.raw('SET session_replication_role = DEFAULT;');
}

/**
 * Cerrar conexión a la base de datos
 */
export async function closeDatabase() {
    if (testDb) {
        await testDb.destroy();
        testDb = null;
    }
}

/**
 * Configurar base de datos para pruebas (ejecutar migraciones y limpiar)
 */
export async function setupDatabase() {
    await runMigrations();
    await cleanDatabase();
}

/**
 * Limpiar base de datos después de las pruebas
 */
export async function teardownDatabase() {
    await cleanDatabase();
    await closeDatabase();
}

export default {
    getTestDb,
    runMigrations,
    rollbackMigrations,
    cleanDatabase,
    closeDatabase,
    setupDatabase,
    teardownDatabase,
};
