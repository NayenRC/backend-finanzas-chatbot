
import Model from './Model.js';
import db from '../config/db.js';

// Modelo para mensajes de chat que representa los mensajes intercambiados en el chat

class ChatMensaje extends Model {
  static get tableName() {
    return 'chat_mensaje';
  }

  static get primaryKey() {
    return 'id_chat';
  }

  static async findByUser(user_id) {
    return db(this.tableName)
      .where('user_id', user_id)
      .orderBy('creado_en', 'asc');
  }
}

export default ChatMensaje;
