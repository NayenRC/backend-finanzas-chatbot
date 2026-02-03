import Model from './Model.js';

class MovimientoAhorro extends Model {
  static get tableName() {
    return 'movimiento_ahorro';
  }

  static get idColumn() {
    return 'id_movimiento';
  }

  static findByMeta(meta_id) {
    return this.query()
      .where('meta_id', meta_id)
      .orderBy('fecha', 'asc');
  }
}

export default MovimientoAhorro;
