import Model from './Model.js';
import db from '../config/db.js';

/**
 * Modelo MetaAhorro
 * Representa una meta de ahorro creada por un usuario
 */
class MetaAhorro extends Model {

  static get tableName() {
    return 'meta_ahorro';
  }

  static get primaryKey() {
    return 'id_meta';
  }

  /* ===============================
     Metas de un usuario
  =============================== */
  static async findByUser(user_id) {
    return db(this.tableName)
      .where('user_id', user_id)
      .orderBy('creado_en', 'desc');
  }

  /* ===============================
     Buscar meta por ID + usuario
  =============================== */
  static async findByIdAndUser(id, user_id) {
    return db(this.tableName)
      .where(this.primaryKey, id)
      .andWhere('user_id', user_id)
      .first();
  }

  /* ===============================
     Actualizar meta (seguridad por usuario)
  =============================== */
  static async updateByUser(id, user_id, data) {
    const [result] = await db(this.tableName)
      .where(this.primaryKey, id)
      .andWhere('user_id', user_id)
      .update(data)
      .returning('*');

    return result;
  }

  /* ===============================
     Eliminar meta
  =============================== */
  static async deleteByUser(id, user_id) {
    return db(this.tableName)
      .where(this.primaryKey, id)
      .andWhere('user_id', user_id)
      .del();
  }
}

export default MetaAhorro;
