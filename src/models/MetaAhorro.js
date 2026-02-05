import Model from './Model.js';

class MetaAhorro extends Model {
  static get tableName() {
    return 'meta_ahorro';
  }

  static get idColumn() {
    return 'id_meta';
  }
}



export default MetaAhorro;
