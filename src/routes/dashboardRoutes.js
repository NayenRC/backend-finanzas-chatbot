import { Router } from "express";
import { getDashboardSummary } from "../controllers/DashboardController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/summary", authenticateToken, getDashboardSummary);

export default router;
