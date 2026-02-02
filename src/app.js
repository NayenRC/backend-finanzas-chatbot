import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { Model } from 'objection';

import db from './config/db.js';
import router from './routes/index.js';

Model.knex(db);

const app = express();

/* =====================
   CORS SIMPLE (FUNCIONA)
===================== */
app.use(cors({
  origin: true, // 🔑 refleja automáticamente el origin (Vercel)
  credentials: false, // 🔑 NO usas cookies
}));

app.use(express.json());
app.use(morgan('dev'));

app.use('/api', router);

app.listen(process.env.PORT || 3000, () => {
  console.log('🚀 Backend running');
});
