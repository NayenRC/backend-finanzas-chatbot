/**
 * Clase Base Model
 *
 * Esta clase sirve como una abstracción simple sobre Knex para realizar
 * operaciones comunes de base de datos (CRUD).
 *
 * Conceptos Educativos:
 * - Clases y Herencia en JavaScript.
 * - Métodos estáticos vs de instancia.
 * - Promesas y Async/Await.
 * - Inyección de dependencias (el objeto db).
 */

import db from '../config/db.js';

class Model {
  /**
   * Nombre de la tabla en la base de datos.
   * Debe ser sobrescrito por las clases hijas.
   */
  static get tableName() {
    throw new Error('Debe definir static get tableName() en el modelo');
  }

  /**
   * Clave primaria de la tabla. Por defecto 'id'.
   */
  static get primaryKey() {
    return 'id';
  }

  /**
   * Obtiene todos los registros de la tabla.
   * @returns {Promise<Array>}
   */
  static async all() {
    return db(this.tableName).select('*');
  }

  /**
   * Encuentra un registro por su ID.
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  static async find(id) {
    return db(this.tableName).where(this.primaryKey, id).first();
  }

  /**
   * Crea un nuevo registro.
   * @param {Object} data - Objeto con los datos a insertar.
   * @returns {Promise<Object>} - Retorna el registro creado.
   */
  static async create(data) {
    const [result] = await db(this.tableName).insert(data).returning('*'); // PostgreSQL soporta returning
    return result;
  }

  /**
   * Actualiza un registro existente.
   * @param {number|string} id
   * @param {Object} data
   * @returns {Promise<Object>} - Retorna el registro actualizado.
   */
  static async update(id, data) {
    const [result] = await db(this.tableName)
      .where(this.primaryKey, id)
      .update(data)
      .returning('*');
    return result;
  }

  /**
   * Elimina un registro por su ID.
   * @param {number|string} id
   * @returns {Promise<number>} - Retorna el número de filas afectadas (idealmente 1).
   */
  static async delete(id) {
    return db(this.tableName).where(this.primaryKey, id).del();
  }
}

export default Model;
