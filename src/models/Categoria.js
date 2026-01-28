import Model from './Model.js';
import db from '../config/db.js';

class Categoria extends Model {
    static get tableName() {
        return 'categorias';
    }

    static get primaryKey() {
        return 'id_categoria';
    }

    static async findByUser(user_id) {
        return db(this.tableName)
            .where(function () {
                this.where('user_id', user_id).orWhereNull('user_id');
            })
            .orderBy('nombre', 'asc');
    }
}

export default Categoria;
