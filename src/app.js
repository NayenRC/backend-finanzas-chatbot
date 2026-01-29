import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { Model } from 'objection'; // <--- IMPORTANTE: Importar Model

import db from './config/db.js';     // <--- IMPORTANTE: Importar la conexión
import router from './routes/index.js';
import telegramRoutes from './routes/telegramRoutes.js';
// import finanzasRoutes from './routes/finanzas.routes.js';
import './bot/telegramBot.js'; // Asegura que el bot de Telegram se inicie
import './config/db.js'; // Inicializa la conexión a la base de datos


// --- CONECTAR OBJECTION ---
Model.knex(db);

const app = express();
const PORT = process.env.PORT || 3000;

// =====================
// Middlewares
// =====================
const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);

    // Permitir dominios de Vercel dinámicamente
    const isVercel = origin.endsWith('.vercel.app');

    if (allowedOrigins.indexOf(origin) !== -1 || isVercel) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// =====================
// Rutas API
// =====================
app.use('/api', router);

// =====================
// Rutas Telegram (SOLO webhook / auth)
// =====================
app.use(telegramRoutes);
// app.use(finanzasRoutes);

// =====================
// Iniciar servidor
// =====================
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
