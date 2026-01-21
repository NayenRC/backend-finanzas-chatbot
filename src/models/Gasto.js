import Model from './Model.js';
import db from '../config/db.js';

// Modelo para gastos que representa los gastos de un usuario

class Gasto extends Model {
  static get tableName() {
    return 'gasto';
  }

  static get primaryKey() {
    return 'id_gasto';
  }

  // Gastos de un usuario
  static async findByUser(user_id) {
    return db(this.tableName)
      .where('user_id', user_id)
      .orderBy('fecha', 'desc');
  }

  // Total de gastos por usuario
  static async totalByUser(user_id) {
    const [{ total }] = await db(this.tableName)
      .where('user_id', user_id)
      .sum('monto as total');

    return total || 0;
  }
}

export default Gasto;
