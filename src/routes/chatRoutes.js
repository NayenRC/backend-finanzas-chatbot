import express from 'express';
import { sendMessage, getHistory } from '../controllers/ChatController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/message', authenticateToken, sendMessage);
router.get('/history', authenticateToken, getHistory);

export default router;
