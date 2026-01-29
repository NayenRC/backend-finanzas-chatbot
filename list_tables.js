import db from './src/config/db.js';

async function listTables() {
    try {
        const tables = await db.raw("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
        console.log("--- Tables ---");
        console.log(tables.rows.map(r => r.tablename));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

listTables();
