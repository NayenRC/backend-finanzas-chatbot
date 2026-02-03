export const up = async function (knex) {
    if (!(await knex.schema.hasTable('meta_ahorro'))) {
        await knex.schema.createTable('meta_ahorro', (table) => {
            table.increments('id_meta').primary();
            table.uuid('user_id').notNullable().references('user_id').inTable('usuarios').onDelete('CASCADE');
            table.string('nombre').notNullable();
            table.decimal('monto_objetivo', 14, 2).notNullable();
            table.decimal('monto_actual', 14, 2).defaultTo(0);
            table.date('fecha_limite').nullable();
            table.string('icono').nullable();
            table.string('color').nullable();
            table.timestamps(true, true);
        });
    }
};

export const down = async function (knex) {
    // down logic (optional)
};
