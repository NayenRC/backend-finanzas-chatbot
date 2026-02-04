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

  static findByIdAndUser(id, user_id) {
    return this.query()
      .findById(id)
      .where('user_id', user_id);
  }

  static async updateByUser(id, user_id, data) {
    const updated = await this.query()
      .patch(data)
      .where(this.idColumn, id)
      .where('user_id', user_id)
      .returning('*');
    return updated[0] || null;
  }

  static async deleteByUser(id, user_id) {
    const deleted = await this.query()
      .delete()
      .where(this.idColumn, id)
      .where('user_id', user_id);
    return deleted > 0;
  }
}

export default Ingreso;



