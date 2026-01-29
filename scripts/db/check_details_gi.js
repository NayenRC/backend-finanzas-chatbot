import knex from 'knex';
import 'dotenv/config';

const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    },
});

async function checkDetails() {
    try {
        const tables = ['gasto', 'ingreso'];
        for (const table of tables) {
            const columns = await db.raw(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '${table}'
            `);
            console.log(`COLUMNS_${table.toUpperCase()}:`, columns.rows);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await db.destroy();
    }
}

checkDetails();
