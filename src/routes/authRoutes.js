import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { login } from "../controllers/authController.js";

const router = Router();

// 🔐 LOGIN con Supabase Auth
router.post("/auth/login", login);

// 👤 PERFIL protegido con JWT propio
router.get("/profile", authenticateToken, (req, res) => {
  res.json(req.user);
});

export default router;
