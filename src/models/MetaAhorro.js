import Model from './Model.js';

class MetaAhorro extends Model {
  static get tableName() {
    return 'meta_ahorro';
  }

  static get idColumn() {
    return 'id_meta';
  }

  static findByUser(user_id) {
    return this.query()
      .where('user_id', user_id)
      .orderBy('created_at', 'desc');
  }
}

export default MetaAhorro;
