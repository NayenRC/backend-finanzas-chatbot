/**
 * Configuración de la Base de Datos
 *
 * Este archivo establece la conexión con la base de datos PostgreSQL usando Knex.
 * Se utiliza el patrón Singleton implícito de los módulos de Node.js para asegurar
 * que solo exista una instancia de conexión.
 */

import knex from 'knex';
import knexConfig from '../../knexfile.js';

// Seleccionamos la configuración basada en el entorno (development por defecto)
const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

// Inicializamos la instancia de Knex
const db = knex(config);

// Exportamos la instancia para usarla en los modelos
export default db;
