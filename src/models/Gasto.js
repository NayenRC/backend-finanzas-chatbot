import Model from './Model.js';
import Categoria from './Categoria.js';

class Gasto extends Model {
  static get tableName() {
    return 'gastos';
  }

  static get idColumn() {
    return 'id_gasto';
  }

  static get relationMappings() {
    return {
      categoria: {
        relation: Model.BelongsToOneRelation,
        modelClass: Categoria,
        join: {
          from: 'gastos.categoria_id',
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

export default Gasto;

