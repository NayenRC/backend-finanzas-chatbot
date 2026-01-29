export const up = async function (knex) {
    const hasTable = await knex.schema.hasTable('ingreso');
    if (hasTable) {
        const hasColumn = await knex.schema.hasColumn('ingreso', 'categoria_id');
        if (!hasColumn) {
            await knex.schema.alterTable('ingreso', (table) => {
                table.integer('categoria_id').unsigned().references('id_categoria').inTable('categorias').onDelete('SET NULL');
            });
            console.log('✅ Columna categoria_id añadida a la tabla ingreso');
        }
    }
};

export const down = async function (knex) {
    const hasTable = await knex.schema.hasTable('ingreso');
    if (hasTable) {
        const hasColumn = await knex.schema.hasColumn('ingreso', 'categoria_id');
        if (hasColumn) {
            await knex.schema.alterTable('ingreso', (table) => {
                table.dropColumn('categoria_id');
            });
        }
    }
};
