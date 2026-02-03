import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { Model } from 'objection';

import db from './config/db.js';
import router from './routes/index.js';

Model.knex(db);

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', router);

const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: '🚀 SmartFin Backend API running',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running`);

  if (process.env.ENABLE_TELEGRAM === 'true') {
  import('./bot/startTelegramBot.js')
    .then(m => m.startTelegramBot());
}

});
