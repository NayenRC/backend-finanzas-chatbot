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

import { Model as ObjectionModel } from 'objection';
import db from '../config/db.js';

class Model extends ObjectionModel {
  /**
   * Nombre de la tabla en la base de datos.
   */
  static get tableName() {
    throw new Error('Debe definir static get tableName() en el modelo');
  }

  /**
   * Clave primaria de la tabla. Por defecto 'id'.
   */
  static get idColumn() {
    return 'id';
  }

  /**
   * Obtiene todos los registros de la tabla.
   */
  static async all() {
    return this.query();
  }

  /**
   * Encuentra un registro por su ID.
   */
  static async find(id) {
    return this.query().findById(id);
  }

  /**
   * Crea un nuevo registro.
   */
  static async create(data) {
    return this.query().insert(data).returning('*');
  }

  /**
   * Actualiza un registro existente.
   */
  static async update(id, data) {
    return this.query().patchAndFetchById(id, data);
  }

  /**
   * Elimina un registro por su ID.
   */
  static async delete(id) {
    return this.query().deleteById(id);
  }
}

export default Model;
