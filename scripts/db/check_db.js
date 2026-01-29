import knex from 'knex';
import 'dotenv/config';

const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    },
});

async function checkTables() {
    try {
        const tables = await db.raw("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        const names = tables.rows.map(r => r.table_name);
        console.log('TABLES_START');
        console.log(JSON.stringify(names));
        console.log('TABLES_END');

        for (const table of names) {
            if (table === 'usuario' || table === 'usuarios') {
                const columns = await db.raw(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}'`);
                console.log(`COLUMNS_${table.toUpperCase()}_START`);
                console.log(JSON.stringify(columns.rows.map(r => r.column_name)));
                console.log(`COLUMNS_${table.toUpperCase()}_END`);
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await db.destroy();
    }
}

checkTables();
