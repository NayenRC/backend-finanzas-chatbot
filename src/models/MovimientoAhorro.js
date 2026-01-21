import Model from './Model.js';
import db from '../config/db.js';

// Modelo para movimientos de ahorro asociados a una meta de ahorro

class MovimientoAhorro extends Model {
  static get tableName() {
    return 'movimiento_ahorro';
  }

  static get primaryKey() {
    return 'id_movimiento';
  }

  static async findByMeta(meta_id) {
    return db(this.tableName)
      .where('meta_id', meta_id)
      .orderBy('fecha', 'asc');
  }
}

export default MovimientoAhorro;
