import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';

const router = Router();

// 🔑 PRE-FLIGHT (OBLIGATORIO)
router.options('*', (req, res) => {
  res.sendStatus(204);
});

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

export default router;
