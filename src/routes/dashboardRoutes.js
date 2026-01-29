import { Router } from "express";
import { getDashboardSummary, getDashboardResumen } from "../controllers/DashboardController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/summary", authenticateToken, getDashboardSummary);
router.get("/resumen", authenticateToken, getDashboardResumen);

export default router;
