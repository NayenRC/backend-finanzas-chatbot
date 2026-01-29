import db from '../../src/config/db.js';

async function checkAllSchema() {
    try {
        const tables = ['usuario', 'ingreso', 'gasto', 'categorias'];

        for (const table of tables) {
            const hasTable = await db.schema.hasTable(table);
            if (!hasTable) {
                console.log(`❌ Table ${table} does not exist`);
                continue;
            }

            const columns = await db(table).columnInfo();
            console.log(`\n--- Columns for ${table} ---`);
            for (const col in columns) {
                console.log(`${col}: ${columns[col].type}`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAllSchema();
