import db from './src/config/db.js';
import { Model } from 'objection';

Model.knex(db);

async function checkTables() {
    try {
        const hasMetas = await db.schema.hasTable('meta_ahorro');
        console.log(`Tabla 'meta_ahorro' existe: ${hasMetas ? 'YES ✅' : 'NO ❌'}`);

        if (hasMetas) {
            const columns = await db('meta_ahorro').columnInfo();
            console.log('Columnas:', Object.keys(columns));
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkTables();
