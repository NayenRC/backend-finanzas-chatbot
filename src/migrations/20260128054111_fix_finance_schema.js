export const up = async function (knex) {
    const dropConstraintIfExists = async (tableName, columnName) => {
        const constraintName = `${tableName}_${columnName}_foreign`;
        await knex.raw(`ALTER TABLE "${tableName}" DROP CONSTRAINT IF EXISTS "${constraintName}"`);
    };

    // Corregir Categorias
    const hasCategorias = await knex.schema.hasTable('categorias');
    if (hasCategorias) {
        await dropConstraintIfExists('categorias', 'user_id');
        await knex.schema.alterTable('categorias', (table) => {
            table.uuid('user_id').alter().references('user_id').inTable('usuario').onDelete('CASCADE');
        });
    }

    // Corregir Gasto
    const hasGasto = await knex.schema.hasTable('gasto');
    if (hasGasto) {
        await dropConstraintIfExists('gasto', 'user_id');
        await knex.schema.alterTable('gasto', (table) => {
            table.uuid('user_id').alter().references('user_id').inTable('usuario').onDelete('CASCADE');
        });
    }

    // Corregir Ingreso
    const hasIngreso = await knex.schema.hasTable('ingreso');
    if (hasIngreso) {
        await dropConstraintIfExists('ingreso', 'user_id');
        await knex.schema.alterTable('ingreso', (table) => {
            table.uuid('user_id').alter().references('user_id').inTable('usuario').onDelete('CASCADE');
        });
    }
};

export const down = function (knex) {
    return Promise.resolve();
};
