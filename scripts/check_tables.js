import db from '../src/config/db.js';

async function checkTables() {
    try {
        const tables = await db('information_schema.tables')
            .select('table_name')
            .where('table_schema', 'public');

        console.log('📊 Tablas en la base de datos:');
        tables.forEach(t => console.log(` - ${t.table_name}`));

        console.log('\n🔍 Columnas de "ingresos":');
        const columnsIngresos = await db('information_schema.columns')
            .select('column_name', 'data_type')
            .where('table_name', 'ingresos');
        columnsIngresos.forEach(c => console.log(` - ${c.column_name} (${c.data_type})`));

        console.log('\n🔍 Columnas de "gastos":');
        const columnsGastos = await db('information_schema.columns')
            .select('column_name', 'data_type')
            .where('table_name', 'gastos');
        columnsGastos.forEach(c => console.log(` - ${c.column_name} (${c.data_type})`));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error verificando tablas:', error);
        process.exit(1);
    }
}

checkTables();
