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

  test: {
    client: process.env.DB_CLIENT || 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'backend_finanzas_test',
    },
    migrations: {
      directory: './src/migrations',
    },
    seeds: {
      directory: './src/seeds',
    },
    pool: {
      min: 2,
      max: 10,
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
