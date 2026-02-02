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

// ✅ CORS SIMPLE Y CORRECTO
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://smartfin-front.vercel.app'
  ],
  credentials: true,
}));

app.options('*', cors());

app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api', router);
app.use(telegramRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
