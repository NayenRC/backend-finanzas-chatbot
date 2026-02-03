/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    const exists = await knex.schema.hasTable('chat_mensaje');
    if (!exists) {
        return knex.schema.createTable('chat_mensaje', (table) => {
            table.increments('id_chat').primary();
            table.uuid('user_id').notNullable().references('user_id').inTable('usuarios').onDelete('CASCADE');
            table.string('rol').notNullable(); // 'user' o 'assistant'
            table.text('mensaje').notNullable();
            table.timestamp('creado_en').defaultTo(knex.fn.now());
        });
    }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    return knex.schema.dropTableIfExists('chat_mensaje');
}
