/**
 * Modelo Article
 *
 * Representa la tabla 'articles' en la base de datos.
 * Extiende la funcionalidad básica de la clase Model.
 */

import Model from './Model.js';

class Article extends Model {
  // Definimos el nombre de la tabla asociada a este modelo
  static get tableName() {
    return 'articles';
  }

  // Podemos agregar métodos específicos para este modelo
  // Por ejemplo, buscar por título
  static async findByTitle(title) {
    return this.query().where('title', 'like', `%${title}%`);
  }
}

export default Article;
