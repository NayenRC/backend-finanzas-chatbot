/**
 * Archivo Principal de la Aplicación (Entry Point)
 *
 * Configura el servidor Express, middlewares y rutas.
 */

import 'dotenv/config';
//import './bot/telegramBot.js'; 
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import router from './routes/router.js';
import telegramRoutes from './routes/telegram.routes.js';
import finanzasRoutes from './routes/finanzas.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// =====================
// Middlewares
// =====================
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// =====================
// RUTA RAÍZ (IMPORTANTE)
// =====================
app.get('/', (req, res) => {
  res.json({
    message: 'SmartFin Backend activo 🚀',
    status: 'OK'
  });
});

// =====================
// HEALTH CHECK
// =====================
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend funcionando correctamente'
  });
});

// =====================
// Rutas API
// =====================
app.use('/api', router);

// =====================
// Import
// =====================
app.use(telegramRoutes);
app.use(finanzasRoutes);

// =====================
// Iniciar servidor
// =====================
app.listen(3000, () => {
  console.log('🚀 Servidor corriendo en http://localhost:3000');
});

