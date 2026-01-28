import { Router } from "express";
import {
  index,
  show,
  store,
  update,
  destroy,
} from "../controllers/MetaAhorroController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authenticateToken);

router.get("/", index);
router.get("/:id", show);
router.post("/", store);
router.put("/:id", update);
router.delete("/:id", destroy);
router.get("/usuario/:userId", index);

import { index as movIndex } from "../controllers/MovimientoAhorroController.js";
router.get("/:metaId/movimientos", movIndex);

export default router;
