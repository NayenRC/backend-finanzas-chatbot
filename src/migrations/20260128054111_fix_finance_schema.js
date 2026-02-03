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
            table.uuid('user_id').alter().references('user_id').inTable('usuarios').onDelete('CASCADE');
        });
    }

    // Corregir Gasto
    const hasGasto = await knex.schema.hasTable('gastos');
    if (hasGasto) {
        await dropConstraintIfExists('gastos', 'user_id');
        await knex.schema.alterTable('gastos', (table) => {
            table.uuid('user_id').alter().references('user_id').inTable('usuarios').onDelete('CASCADE');
        });
    }

    // Corregir Ingreso
    const hasIngreso = await knex.schema.hasTable('ingresos');
    if (hasIngreso) {
        await dropConstraintIfExists('ingresos', 'user_id');
        await knex.schema.alterTable('ingresos', (table) => {
            table.uuid('user_id').alter().references('user_id').inTable('usuarios').onDelete('CASCADE');
        });
    }
};

export const down = function (knex) {
    return Promise.resolve();
};
