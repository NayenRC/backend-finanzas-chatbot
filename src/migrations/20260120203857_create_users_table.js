export const up = function (knex) {
    return knex.schema.createTable('usuarios', function (table) {
        table.uuid('user_id').primary(); // ID único (UUID)
        table.string('telegram_id').unique().nullable(); // ID Telegram (para bot)
        table.string('nombre').notNullable();
        table.string('email').unique().nullable();
        table.string('username').nullable(); // Username Telegram
        table.string('moneda').defaultTo('CLP');
        table.string('telefono').nullable();
        table.boolean('activo').defaultTo(true);
        table.timestamps(true, true);
    });
};

export const down = function (knex) {
    return knex.schema.dropTableIfExists('usuarios');
};
