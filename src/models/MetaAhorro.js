import Model from './Model.js';
import db from '../config/db.js';

// Modelo para metas de ahorro de un usuario
class MetaAhorro extends Model {
  static get tableName() {
    return 'meta_ahorro';
  }

  static get primaryKey() {
    return 'id_meta';
  }

  static async findByUser(user_id) {
    return db(this.tableName)
      .where('user_id', user_id)
      .orderBy('creado_en', 'desc'); // Corregido según schema dump
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

export default MetaAhorro;
