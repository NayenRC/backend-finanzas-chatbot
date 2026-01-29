export const up = async function (knex) {
    // 1. Crear tabla INGRESO si no existe
    if (!(await knex.schema.hasTable('ingreso'))) {
        await knex.schema.createTable('ingreso', (table) => {
            table.increments('id_ingreso').primary();
            table.uuid('user_id').notNullable().references('user_id').inTable('usuario').onDelete('CASCADE');
            table.decimal('monto', 14, 2).notNullable();
            table.string('descripcion').notNullable();
            table.timestamp('fecha').defaultTo(knex.fn.now());
            table.string('fuente').nullable(); // Ej: 'Sueldo', 'Venta'
            table.timestamps(true, true);
        });
    }

    // 2. Crear tabla GASTO si no existe
    if (!(await knex.schema.hasTable('gasto'))) {
        await knex.schema.createTable('gasto', (table) => {
            table.increments('id_gasto').primary();
            table.uuid('user_id').notNullable().references('user_id').inTable('usuario').onDelete('CASCADE');
            // Importante: categoría es opcional o requerida según tu lógica
            // Asegúrate de que 'categorias' exista antes, o usa entero/uuid según corresponda.
            // Asumiendo que 'categorias' usa id_categoria (integer)
            table.integer('categoria_id').unsigned().references('id_categoria').inTable('categorias').onDelete('SET NULL');

            table.decimal('monto', 14, 2).notNullable();
            table.string('descripcion').notNullable();
            table.timestamp('fecha').defaultTo(knex.fn.now());
            table.timestamps(true, true);
        });
    }
};

export const down = async function (knex) {
    await knex.schema.dropTableIfExists('gasto');
    await knex.schema.dropTableIfExists('ingreso');
};
