import Model from './Model.js';
import db from '../config/db.js';
// Modelo para ingresos que representa los ingresos de un usuario

class Ingreso extends Model {
  static get tableName() {
    return 'ingreso';
  }

  static get primaryKey() {
    return 'id_ingreso';
  }

  static async findByUser(user_id) {
    return db(this.tableName)
      .where('user_id', user_id)
      .orderBy('fecha', 'desc');
  }
}

export default Ingreso;
