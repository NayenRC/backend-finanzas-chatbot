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

export default ConsejoFinanciero;
