import Model from './Model.js';

class Categoria extends Model {
    static get tableName() {
        return 'categorias';
    }

    static get idColumn() {
        return 'id_categoria';
    }

    static async findByUser(user_id) {
        return this.query()
            .where(function () {
                this.where('user_id', user_id).orWhereNull('user_id');
            })
            .orderBy('nombre', 'asc');
    }
}

export default Categoria;
