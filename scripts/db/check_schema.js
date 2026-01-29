import db from '../../src/config/db.js';

async function checkUserSchema() {
    try {
        const columns = await db('usuario').columnInfo();
        console.log('--- Columns for usuario ---');
        for (const col in columns) {
            console.log(`${col}: ${columns[col].type} (${columns[col].maxLength})`);
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkUserSchema();
