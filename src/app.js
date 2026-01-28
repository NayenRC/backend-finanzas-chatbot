import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { Model } from 'objection';
import 'dotenv/config';

import db from './config/db.js';
import router from './routes/index.js';
import telegramRoutes from './routes/telegramRoutes.js';


// --- CONECTAR OBJECTION ---
Model.knex(db);

const app = express();
const PORT = process.env.PORT || 3000;

// =====================
// Middlewares
// =====================
app.use(cors());
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


// =====================
// Iniciar servidor
// =====================
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
