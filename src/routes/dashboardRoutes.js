import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { getDashboardResumen } from "../controllers/DashboardController.js";

const router = Router();

router.get("/resumen", authenticateToken, getDashboardResumen);

export default router;
