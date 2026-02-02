import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { Model } from 'objection';

import db from './config/db.js';
import router from './routes/index.js';
import telegramRoutes from './routes/telegramRoutes.js';

// Telegram opcional
if (process.env.ENABLE_TELEGRAM === 'true') {
  import('./bot/telegramBot.js');
}

Model.knex(db);

const app = express();
const PORT = process.env.PORT || 3000;

/* =====================
   CORS — PRODUCCIÓN OK
===================== */
const allowedOrigins = [
  'http://localhost:5173',
  'https://smartfin-front.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://smartfin-front.vercel.app',
    'https://smartfin-front-nkb32l7l2-nayenrcs-projects.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ⚠️ MUY IMPORTANTE
app.options('*', cors());

