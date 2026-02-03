import db from '../src/config/db.js';

async function seedCategories() {
    try {
        console.log('🌱 Insertando categorías...');

        const categorias = [
            // Categorías de GASTO
            { nombre: 'Alimentación', tipo: 'GASTO' },
            { nombre: 'Transporte', tipo: 'GASTO' },
            { nombre: 'Entretenimiento', tipo: 'GASTO' },
            { nombre: 'Salud', tipo: 'GASTO' },
            { nombre: 'Educación', tipo: 'GASTO' },
            { nombre: 'Hogar', tipo: 'GASTO' },
            { nombre: 'Ropa', tipo: 'GASTO' },
            { nombre: 'Servicios', tipo: 'GASTO' },
            { nombre: 'Otros Gastos', tipo: 'GASTO' },
            // Categorías de INGRESO
            { nombre: 'Salario', tipo: 'INGRESO' },
            { nombre: 'Freelance', tipo: 'INGRESO' },
            { nombre: 'Ventas', tipo: 'INGRESO' },
            { nombre: 'Inversiones', tipo: 'INGRESO' },
            { nombre: 'Regalo', tipo: 'INGRESO' },
            { nombre: 'Otros Ingresos', tipo: 'INGRESO' }
        ];

        // Verificar si ya existen categorías
        const existing = await db('categorias').select('*');
        if (existing.length > 0) {
            console.log('⚠️ Ya existen categorías en la base de datos:');
            existing.forEach(c => console.log(`   - ${c.nombre} (${c.tipo})`));
            console.log('\n¿Deseas eliminar las existentes y recrear? Ejecuta con --force');

            if (!process.argv.includes('--force')) {
                await db.destroy();
                process.exit(0);
            }

            console.log('🗑️ Eliminando categorías existentes...');
            await db('categorias').del();
        }

        // Insertar nuevas categorías
        await db('categorias').insert(categorias);

        const result = await db('categorias').select('*');
        console.log('\n✅ Categorías creadas exitosamente:');
        console.log('\n📂 GASTOS:');
        result.filter(c => c.tipo === 'GASTO').forEach(c => console.log(`   - ${c.nombre}`));
        console.log('\n📂 INGRESOS:');
        result.filter(c => c.tipo === 'INGRESO').forEach(c => console.log(`   - ${c.nombre}`));

        await db.destroy();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        await db.destroy();
        process.exit(1);
    }
}

seedCategories();
