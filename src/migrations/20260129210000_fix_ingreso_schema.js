export const up = async function (knex) {
    const hasTable = await knex.schema.hasTable('ingresos');
    if (hasTable) {
        const hasColumn = await knex.schema.hasColumn('ingresos', 'categoria_id');
        if (!hasColumn) {
            await knex.schema.alterTable('ingresos', (table) => {
                table.integer('categoria_id').unsigned().references('id_categoria').inTable('categorias').onDelete('SET NULL');
            });
            console.log('✅ Columna categoria_id añadida a la tabla ingresos');
        }
    }
};

export const down = async function (knex) {
    const hasTable = await knex.schema.hasTable('ingresos');
    if (hasTable) {
        const hasColumn = await knex.schema.hasColumn('ingresos', 'categoria_id');
        if (hasColumn) {
            await knex.schema.alterTable('ingresos', (table) => {
                table.dropColumn('categoria_id');
            });
        }
    }
};
