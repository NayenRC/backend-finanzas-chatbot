import { Model } from 'objection';
import db from '../config/db.js';
import Categoria from './Categoria.js';

class Ingreso extends Model {
  static get tableName() {
    return 'ingresos';
  }

  static get idColumn() {
    return 'id_ingreso';
  }

  static get relationMappings() {
    return {
      categoria: {
        relation: Model.BelongsToOneRelation,
        modelClass: Categoria,
        join: {
          from: 'ingresos.categoria_id',
          to: 'categorias.id_categoria'
        }
      }
    };
  }

  static async findByUser(user_id) {
    return db(this.tableName)
      .where('user_id', user_id)
      .orderBy('fecha', 'desc');
  }

  static async findByIdAndUser(id, user_id) {
    return db(this.tableName)
      .where(this.primaryKey, id)
      .andWhere('user_id', user_id)
      .first();
  }

  static async updateByUser(id, user_id, data) {
    const [result] = await db(this.tableName)
      .where(this.primaryKey, id)
      .andWhere('user_id', user_id)
      .update(data)
      .returning('*');
    return result;
  }

  static async deleteByUser(id, user_id) {
    return db(this.tableName)
      .where(this.primaryKey, id)
      .andWhere('user_id', user_id)
      .del();
  }
}

export default Ingreso;

