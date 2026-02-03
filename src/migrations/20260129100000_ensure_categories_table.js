export const up = async function (knex) {
    // Crear tabla categorias si no existe
    if (!(await knex.schema.hasTable('categorias'))) {
        await knex.schema.createTable('categorias', (table) => {
            table.increments('id_categoria').primary();
            table.string('nombre').notNullable();
            table.string('tipo').notNullable(); // 'ingreso' o 'gasto'
            // Opcional: icon, color, etc.
            table.uuid('user_id').nullable().references('user_id').inTable('usuarios').onDelete('CASCADE');
            table.timestamps(true, true);
        });

        // Insertar categorías por defecto
        await knex('categorias').insert([
            { nombre: 'Salario', tipo: 'ingreso', user_id: null },
            { nombre: 'Ventas', tipo: 'ingreso', user_id: null },
            { nombre: 'Alimentación', tipo: 'gasto', user_id: null },
            { nombre: 'Transporte', tipo: 'gasto', user_id: null },
            { nombre: 'Vivienda', tipo: 'gasto', user_id: null },
            { nombre: 'Salud', tipo: 'gasto', user_id: null },
            { nombre: 'Educación', tipo: 'gasto', user_id: null },
            { nombre: 'Entretenimiento', tipo: 'gasto', user_id: null },
        ]);
    } else {
        // Si la tabla EXISTE, verificar si tiene la columna user_id
        const hasUserId = await knex.schema.hasColumn('categorias', 'user_id');
        if (!hasUserId) {
            await knex.schema.alterTable('categorias', (table) => {
                table.uuid('user_id').nullable().references('user_id').inTable('usuarios').onDelete('CASCADE');
            });
        }
    }
};

export const down = async function (knex) {
    // No borramos la tabla en down por seguridad, o solo dropTableIfExists
};
