import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import db from './config/db.js';
import router from './routes/index.js';
import { startTelegramBot } from './bot/startTelegramBot.js';

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('🚀 Backend running');
});

// 🔥 BOT DESPUÉS DEL SERVER
if (process.env.ENABLE_TELEGRAM === 'true') {
  startTelegramBot();
}
