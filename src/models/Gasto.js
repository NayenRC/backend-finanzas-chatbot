import Model from './Model.js';

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
          to: 'categorias.id_categoria'
        }
      }
    };
  }

  static async findByUser(user_id) {
    return this.query()
      .where('user_id', user_id)
      .orderBy('fecha', 'desc');
  }

  static async findByIdAndUser(id, user_id) {
    return db(this.tableName)
      .where(this.primaryKey, id)
      .andWhere('user_id', user_id)
      .first();
  }

  static async updateByUser(id, user_id, data) {
    const [result] = await db(this.tableName)
      .where(this.primaryKey, id)
      .andWhere('user_id', user_id)
      .update(data)
      .returning('*');
    return result;
  }

  static async deleteByUser(id, user_id) {
    return db(this.tableName)
      .where(this.primaryKey, id)
      .andWhere('user_id', user_id)
      .del();
  }
}

export default Gasto;

