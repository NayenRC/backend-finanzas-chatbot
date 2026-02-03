import Model from './Model.js';

import Model from './Model.js';
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
          to: 'categorias.id_categoria',
        },
      },
    };
  }

  static findByUser(user_id) {
    return this.query()
      .where('user_id', user_id)
      .orderBy('fecha', 'desc');
  }
}

export default Ingreso;
