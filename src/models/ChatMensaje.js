
import { Model } from 'objection';
import db from '../config/db.js';

// Modelo para mensajes de chat que representa los mensajes intercambiados en el chat

class ChatMensaje extends Model {
  static get tableName() {
    return 'chat_mensaje';
  }

  static get idColumn() {
    return 'id_chat';
  }

  static async findByUser(user_id) {
    return db(this.tableName)
      .where('user_id', user_id)
      .orderBy('creado_en', 'asc');
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

export default ChatMensaje;
