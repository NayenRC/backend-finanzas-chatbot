import Model from './Model.js';
import db from '../config/db.js'; 

// Modelo para usuarios de la aplicación

class Usuario extends Model {
  static get tableName() {
    return 'usuario';
  }

  static get primaryKey() {
    return 'user_id';
  }

  // Método específico
  static async findByTelegramId(telegram_user_id) {
    return db(this.tableName)
      .where('telegram_user_id', telegram_user_id)
      .first();
  }
}

export default Usuario;
