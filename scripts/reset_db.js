import db from '../src/config/db.js';

async function resetDb() {
    try {
        console.log('🔥 Iniciando borrado completo de tablas...');

        // Desactivar restricciones de clave foránea temporalmente (Postgres specific)
        // await db.raw('SET session_replication_role = "replica";'); 
        // Mejor usamos CASCADE en los drops

        const tables = [
            'knex_migrations', 'knex_migrations_lock', // Reset knex history
            'chat_mensaje', 'meta_ahorro', 'movimiento_ahorro', 'consejo_financiero', // Tablas dependientes
            'gastos', 'gasto',
            'ingresos', 'ingreso',
            'categorias', 'categoria',
            'usuarios', 'usuario', 'users' // Identidades
        ];

        for (const table of tables) {
            await db.raw(`DROP TABLE IF EXISTS "${table}" CASCADE`);
            console.log(`🗑️ Tabla eliminada: ${table}`);
        }

        console.log('✅ Base de datos limpia. Lista para migrar.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error reseteando DB:', error);
        process.exit(1);
    }
}

resetDb();
