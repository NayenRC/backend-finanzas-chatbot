import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { Model } from 'objection';

import db from './config/db.js';
import router from './routes/index.js';
import telegramRoutes from './routes/telegramRoutes.js';

if (process.env.ENABLE_TELEGRAM === 'true') {
  import('./bot/telegramBot.js');
}

import './config/db.js';

// --- CONECTAR OBJECTION ---
Model.knex(db);

const app = express();
const PORT = process.env.PORT || 3000;

// =====================
// Middlewares
// =====================
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:5173',
      'https://smartfin-front.vercel.app'
    ];

    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS bloqueado'));
    }
  },
  credentials: true,
}));

app.options('*', cors());

app.use(morgan('dev'));
app.use(express.json());

// =====================
// Rutas API
// =====================
app.use('/api', router);

// =====================
// Rutas Telegram
// =====================
app.use(telegramRoutes);

// =====================
// Iniciar servidor
// =====================
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
