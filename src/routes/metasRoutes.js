import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import MetaAhorroController from "../controllers/MetaAhorroController.js";

const router = Router();

router.get("/", authenticateToken, MetaAhorroController.index);
router.post("/", authenticateToken, MetaAhorroController.store);
router.put("/:id", authenticateToken, MetaAhorroController.update);
router.delete("/:id", authenticateToken, MetaAhorroController.destroy);

export default router;
