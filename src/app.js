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

Model.knex(db);

const app = express();
const PORT = process.env.PORT || 3000;

// =====================
// CORS (CORRECTO)
// =====================
const allowedOrigins = [
  'http://localhost:5173',
  'https://smartfin-front.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

// =====================
app.use(morgan('dev'));
app.use(express.json());

// =====================
app.use('/api', router);
app.use(telegramRoutes);

// =====================
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
