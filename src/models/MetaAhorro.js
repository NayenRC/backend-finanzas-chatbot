import Model from './Model.js';
import db from '../config/db.js';

// Modelo para metas de ahorro de un usuario
class MetaAhorro extends Model {
  static get tableName() {
    return 'meta_ahorro';
  }

  static get primaryKey() {
    return 'id_meta';
  }

  static async findByUser(user_id) {
    return db(this.tableName)
      .where('user_id', user_id)
      .orderBy('fecha_inicio', 'desc');
  }
}

export default MetaAhorro;
