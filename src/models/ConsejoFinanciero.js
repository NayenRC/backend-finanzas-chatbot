import Model from './Model.js';
import db from '../config/db.js';

// Modelo para consejos financieros que representa los consejos dados a un usuario

class ConsejoFinanciero extends Model {
  static get tableName() {
    return 'consejo_financiero';
  }

  static get primaryKey() {
    return 'id_consejo';
  }

  static async findByUser(user_id) {
    return db(this.tableName)
      .where('user_id', user_id)
      .orderBy('generado_en', 'desc');
  }
}

export default ConsejoFinanciero;
