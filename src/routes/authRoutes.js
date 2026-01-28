import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/login", AuthController.login);
router.post("/register", AuthController.register);
router.get("/profile", authenticateToken, AuthController.getProfile);

// Password Reset Routes
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);
router.get("/verify-reset-token/:token", AuthController.verifyResetToken);

export default router;


