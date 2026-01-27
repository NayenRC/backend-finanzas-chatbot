import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { Model } from 'objection'; // <--- IMPORTANTE: Importar Model
import 'dotenv/config'; 

import db from './config/db.js';     // <--- IMPORTANTE: Importar la conexión
import router from './routes/router.js';
import telegramRoutes from './routes/telegram.routes.js';
import finanzasRoutes from './routes/finanzas.routes.js';
import './bot/telegramBot.js'; // Asegura que el bot de Telegram se inicie
import './config/db.js'; // Inicializa la conexión a la base de datos

// --- CONECTAR OBJECTION A LA BASE DE DATOS ---
Model.knex(db); // <--- Configurar Objection para usar la conexión de Knex

const app = express();
const PORT = process.env.PORT || 3000;

// =====================
// Middlewares
app.use(cors()); 
app.use(morgan('dev')); 
app.use(express.json()); 

// Rutas
app.use('/api', router); // Ojo: Tus rutas empiezan con /api

// =====================
// Import
// =====================
app.use(telegramRoutes);
app.use(finanzasRoutes);

// =====================
// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
