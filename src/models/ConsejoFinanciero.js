import Model from './Model.js';
import db from '../config/db.js';

// Modelo para consejos financieros que representa los consejos dados a un usuario

class ConsejoFinanciero extends Model {
  static get tableName() {
    return 'consejo_financiero';
  }

  static get idColumn() {
    return 'id_consejo';
  }

  static async findByUser(user_id) {
    return this.query()
      .where('user_id', user_id)
      .orderBy('generado_en', 'desc');
  }

  static async findByIdAndUser(id, user_id) {
    return this.query()
      .findById(id)
      .where('user_id', user_id)
      .first();
  }

  static async updateByUser(id, user_id, data) {
    return this.query()
      .patchAndFetchById(id, data)
      .where('user_id', user_id);
  }

  static async deleteByUser(id, user_id) {
    return this.query()
      .deleteById(id)
      .where('user_id', user_id);
  }
}

export default ConsejoFinanciero;
