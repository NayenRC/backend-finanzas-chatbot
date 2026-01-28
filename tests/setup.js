/**
 * Configuración global de pruebas
 * Se ejecuta antes de todas las pruebas
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno de prueba
dotenv.config({ path: join(__dirname, '..', '.env.test') });

// Establecer entorno de prueba
process.env.NODE_ENV = 'test';

// Timeout global para pruebas
jest.setTimeout(10000);

// Suprimir logs de consola durante las pruebas (opcional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };
