import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { Model } from 'objection';

import db from './config/db.js';
import router from './routes/index.js';
import telegramRoutes from './routes/telegramRoutes.js';

Model.knex(db);

const app = express();
const PORT = process.env.PORT || 3000;

/* =====================
   CORS — CORRECTO
===================== */
const allowedOrigins = [
  'http://localhost:5173',
  'https://smartfin-front.vercel.app',
  'https://smartfin-front-nkb32l7l2-nayenrcs-projects.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (Postman, Railway healthcheck)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 🔑 PRE-FLIGHT
app.options('*', cors());

// 🔑 BODY PARSER (ESTO TE FALTABA)
app.use(express.json());

// Logs
app.use(morgan('dev'));

// Rutas
app.use('/api', router);
app.use('/api/telegram', telegramRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
