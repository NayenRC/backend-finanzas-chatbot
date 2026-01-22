import express from 'express';
import { telegramLogin } from '../controllers/TelegramController.js';

const router = express.Router();

router.post('/login', telegramLogin);

export default router;
