import Model from './Model.js';
import db from '../config/db.js';

class Gasto extends Model {
  static get tableName() {
    return 'gasto';
  }

  static get primaryKey() {
    return 'id_gasto';
  }

  static async findByUser(user_id) {
    return db(this.tableName)
      .where('user_id', user_id)
      .orderBy('fecha', 'desc');
  }
}

export default Gasto;
