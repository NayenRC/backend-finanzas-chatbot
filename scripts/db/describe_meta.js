import db from '../../src/config/db.js';

import fs from 'fs';

async function describeTable() {
    try {
        const columns = await db.raw("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'meta_ahorro' AND table_schema = 'public'");
        let output = "--- Columns for meta_ahorro ---\n";
        columns.rows.forEach(row => {
            output += `- ${row.column_name} (${row.data_type})\n`;
        });
        fs.writeFileSync('meta_columns.txt', output);
        console.log("Output written to meta_columns.txt");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

describeTable();
