import { Router } from "express";
import {
  index,
  show,
  store,
  update,
  destroy,
} from "../controllers/UsuarioController.js";
import { index as gastoIndex } from "../controllers/GastoController.js";
import { index as ingresoIndex } from "../controllers/IngresoController.js";
import { index as metaIndex } from "../controllers/MetaAhorroController.js";
import { index as chatIndex } from "../controllers/ChatMensajeController.js";
import { index as consejoIndex } from "../controllers/ConsejoFinancieroController.js";

import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", index);
router.get("/:id", show);
router.post("/", store);
router.put("/:id", update);
router.delete("/:id", destroy);

// Nested resources
router.get("/:userId/gastos", authenticateToken, gastoIndex);
router.get("/:userId/ingresos", authenticateToken, ingresoIndex);
router.get("/:userId/metas", authenticateToken, metaIndex);
router.get("/:userId/mensajes", authenticateToken, chatIndex);
router.get("/:userId/consejos", authenticateToken, consejoIndex);

export default router;
