/**
 * Rutas de Telegram
 */

import { Router } from 'express';
import TelegramController from '../controllers/TelegramController.js';
import { authenticateToken as authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// Login para obtener token
router.post('/telegram/login', TelegramController.login);

// Chat con IA (Protegido)
router.post('/telegram/chat', authMiddleware, TelegramController.chat);

// Obtener Balance (Protegido)
router.get('/telegram/balance', authMiddleware, TelegramController.getBalance);

// Registrar Movimientos (Protegido)
router.post('/telegram/gastos', authMiddleware, TelegramController.registerExpense);
router.post('/telegram/ingresos', authMiddleware, TelegramController.registerIncome);

export default router;