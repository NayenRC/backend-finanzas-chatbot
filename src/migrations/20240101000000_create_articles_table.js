/**
 * Migración para la tabla 'articles'
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable('articles', (table) => {
    table.increments('id').primary(); // ID Auto-incremental
    table.string('title').notNullable(); // Título obligatorio
    table.text('content'); // Contenido
    table.string('author'); // Autor
    table.timestamps(true, true); // created_at y updated_at automáticos
  });
}

/**
 * Deshacer la migración
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTable('articles');
}
