import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

// 🔑 PREFLIGHT PARA AUTH
router.options('*', (req, res) => res.sendStatus(204));

// 🔓 RUTAS PÚBLICAS
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

// 🔒 RUTA PROTEGIDA
router.get('/profile', authenticateToken, AuthController.getProfile);

export default router;
