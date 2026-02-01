import { Router } from "express";
import {
  index,
  show,
  store,
  update,
  destroy,
} from "../controllers/MetaAhorroController.js";
import { index as movIndex } from "../controllers/MovimientoAhorroController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authenticateToken);

// ⚠️ RUTAS ESPECÍFICAS PRIMERO
router.get("/:metaId/movimientos", movIndex);
router.get("/usuario/:userId", index);

// CRUD de metas
router.get("/", index);
router.post("/", store);
router.get("/:id", show);
router.put("/:id", update);
router.delete("/:id", destroy);

export default router;
