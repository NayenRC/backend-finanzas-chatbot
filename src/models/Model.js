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

class Model extends ObjectionModel {}

export default Model;
