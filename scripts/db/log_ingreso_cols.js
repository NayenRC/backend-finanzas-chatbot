import db from '../../src/config/db.js';
import fs from 'fs';

async function logIngresoColumns() {
    try {
        const columns = await db('ingreso').columnInfo();
        fs.writeFileSync('ingreso_columns.json', JSON.stringify(columns, null, 2));
        console.log('✅ Columnas guardadas en ingreso_columns.json');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

logIngresoColumns();
