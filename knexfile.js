import 'dotenv/config';

/**
 * Configuración de Knex para diferentes entornos.
 * Utiliza variables de entorno para la conexión a la base de datos.
 */
export default {
development: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      // Agregamos esto por si Supabase requiere SSL (muy común)
      ssl: process.env.DATABASE_URL.includes('supabase') ? { rejectUnauthorized: false } : false,
    },
    migrations: {
      directory: './src/migrations',
    },
    seeds: {
      directory: './src/seeds',
    },
  },

  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    migrations: {
      directory: './src/migrations',
    },
    seeds: {
      directory: './src/seeds',
    },
  },
};
