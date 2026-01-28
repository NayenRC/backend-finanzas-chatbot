/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function (knex) {
    return knex.schema.createTable('categorias', (table) => {
        table.increments('id_categoria').primary();
        table.string('nombre').notNullable();
        table.string('descripcion');
        table.string('tipo').notNullable(); // 'GASTO' o 'INGRESO'
        table.uuid('user_id').references('user_id').inTable('usuario').onDelete('CASCADE'); // Puede ser nulo para categorías globales
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function (knex) {
    return knex.schema.dropTable('categorias');
};
