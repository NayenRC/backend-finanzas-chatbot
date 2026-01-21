import Model from './Model.js';
// Modelo para usuarios de la aplicación automáticamente conecta con la base de datos

class User extends Model {
  static get tableName() {
    return 'users';
  }

  static async findByEmail(email) {
    // Model.query() uses the connected knex instance access
    // Assuming Model.query() returns knex(tableName)
    return this.query().where({ email }).first();
  }
}

export default User;
