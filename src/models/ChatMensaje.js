import db from '../config/db.js';

const ChatMensaje = {
  async create({ user_id, rol, mensaje }) {
    return db('chat_mensaje').insert({
      user_id,
      rol,
      mensaje
    });
  },

  async getByUser(user_id) {
    return db('chat_mensaje')
      .where({ user_id })
      .orderBy('creado_en', 'asc');
  }
};

export default ChatMensaje;

