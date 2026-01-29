import knex from 'knex';
import 'dotenv/config';

const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    },
});

async function checkConstraints() {
    try {
        const tables = ['categorias', 'gasto', 'ingreso'];
        for (const table of tables) {
            const constraints = await db.raw(`
                SELECT constraint_name 
                FROM information_schema.table_constraints 
                WHERE table_name = '${table}'
            `);
            console.log(`CONSTRAINTS_${table.toUpperCase()}:`, constraints.rows.map(r => r.constraint_name));
        }
    } catch (err) {
        console.error(err);
    } finally {
        await db.destroy();
    }
}

checkConstraints();
