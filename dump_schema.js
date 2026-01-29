import db from './src/config/db.js';
import fs from 'fs';

async function dumpSchema() {
    const tables = ['gasto', 'ingreso', 'meta_ahorro', 'categorias', 'usuario'];
    let report = "SCHEMA DUMP\n============\n";

    for (const t of tables) {
        try {
            const info = await db(t).columnInfo();
            report += `\nTABLE: ${t}\n`;
            report += Object.keys(info).join(', ') + "\n";
        } catch (e) {
            report += `\nTABLE: ${t} - ERROR: ${e.message}\n`;
        }
    }

    fs.writeFileSync('schema_report.txt', report);
    console.log("Report saved to schema_report.txt");
    process.exit(0);
}

dumpSchema();
