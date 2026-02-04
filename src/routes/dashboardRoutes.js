import { Router } from "express";
import { getDashboardResumen } from "../controllers/DashboardController.js";

const router = Router();

// authenticateToken ya se aplica en routes/index.js
router.get("/resumen", getDashboardResumen);

export default router;
