/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    return knex.schema.table('usuario', table => {
        table.string('reset_password_token').nullable().index();
        table.timestamp('reset_password_expires').nullable();
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    return knex.schema.table('usuario', table => {
        table.dropColumn('reset_password_token');
        table.dropColumn('reset_password_expires');
    });
}
