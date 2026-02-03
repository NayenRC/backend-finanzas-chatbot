import Model from './Model.js';

class ChatMensaje extends Model {
  static get tableName() {
    return 'chat_mensaje';
  }

  static get idColumn() {
    return 'id_chat';
  }

  static async findByUser(user_id) {
    return this.query()
      .where('user_id', user_id)
      .orderBy('creado_en', 'asc');
  }

  static async findByIdAndUser(id, user_id) {
    return this.query()
      .findById(id)
      .where('user_id', user_id);
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

export default ChatMensaje;
