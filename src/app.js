import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { Model } from 'objection';

import db from './config/db.js';
import router from './routes/index.js';
import telegramRoutes from './routes/telegramRoutes.js';

// Conectar Objection
Model.knex(db);

const app = express();
const PORT = process.env.PORT || 3000;

// =====================
// 🔥 CORS (FIX FINAL)
// =====================
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://smartfin-front.vercel.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ⚠️ PRE-FLIGHT (ESTO ES CLAVE)
app.options('*', cors());

// =====================
// Middlewares
// =====================
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
// Server
// =====================
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en puerto ${PORT}`);
});
