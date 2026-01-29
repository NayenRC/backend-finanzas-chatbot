import { Router } from "express";
import { processMessage } from "../controllers/ChatController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authenticateToken);

router.post("/", processMessage);

export default router;
