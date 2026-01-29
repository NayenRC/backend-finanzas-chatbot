import db from './src/config/db.js';
import { Model } from 'objection';

Model.knex(db);

async function checkTables() {
    try {
        const table = 'meta_ahorro';
        const hasTable = await db.schema.hasTable(table);
        if (!hasTable) {
            console.log(`❌ Table ${table} does not exist`);
            process.exit(1);
        }

        const columns = await db(table).columnInfo();
        console.log(`--- Columns for ${table} ---`);
        for (const col in columns) {
            console.log(`${col}: ${columns[col].type}`);
        }

        const sample = await db(table).limit(1);
        console.log(`--- Sample Data ---`);
        console.log(JSON.stringify(sample, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkTables();
