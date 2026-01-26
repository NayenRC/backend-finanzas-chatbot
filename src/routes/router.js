/**
 * Definición de Rutas - API de Finanzas
 */

import { Router } from "express";

<<<<<<< HEAD
// Auth
import AuthController from "../controllers/AuthController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

=======
// 🔐 Auth normal
import AuthController from '../controllers/AuthController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
>>>>>>> f215952b8e724f34938bd8a1eee69e82753c1b78
// Dashboard
import { getDashboardSummary } from "../controllers/DashboardController.js";

// 🤖 Auth Telegram
import TelegramAuthController from '../controllers/TelegramAuthController.js';

// Usuarios
import {
  index as usuarioIndex,
  show as usuarioShow,
  store as usuarioStore,
  update as usuarioUpdate,
  destroy as usuarioDestroy,
} from "../controllers/UsuarioController.js";

// Gastos
import {
  index as gastoIndex,
  show as gastoShow,
  store as gastoStore,
  update as gastoUpdate,
  destroy as gastoDestroy,
} from "../controllers/GastoController.js";

// Ingresos
import {
  index as ingresoIndex,
  show as ingresoShow,
  store as ingresoStore,
  update as ingresoUpdate,
  destroy as ingresoDestroy,
} from "../controllers/IngresoController.js";

// Metas de Ahorro
import {
  index as metaIndex,
  show as metaShow,
  store as metaStore,
  update as metaUpdate,
  destroy as metaDestroy,
} from "../controllers/MetaAhorroController.js";

// Movimientos de ahorro
import {
  index as movIndex,
  show as movShow,
  store as movStore,
  update as movUpdate,
  destroy as movDestroy,
} from "../controllers/MovimientoAhorroController.js";

// Chat mensajes
import {
  index as chatIndex,
  show as chatShow,
  store as chatStore,
  destroy as chatDestroy,
} from "../controllers/ChatMensajeController.js";

// Consejos financieros
import {
  index as consejoIndex,
  show as consejoShow,
  store as consejoStore,
  destroy as consejoDestroy,
} from "../controllers/ConsejoFinancieroController.js";

const router = Router();

/**
<<<<<<< HEAD
 * =========================
 * AUTENTICACIÓN
 * =========================
 */
router.post("/login", AuthController.login);
router.post("/register", AuthController.register);
router.get("/profile", authenticateToken, AuthController.getProfile);

/**
 * =========================
 * USUARIOS
 * =========================
=======
 * 🔐 AUTENTICACIÓN NORMAL (WEB / FRONT)
 */
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.get('/profile', authenticateToken, AuthController.getProfile);

/**
 * 🤖 AUTENTICACIÓN TELEGRAM
 */
router.post('/telegram/login', TelegramAuthController.login);

/**
 * 👤 USUARIOS
>>>>>>> f215952b8e724f34938bd8a1eee69e82753c1b78
 */
router.get("/usuarios", usuarioIndex);
router.get("/usuarios/:id", usuarioShow);
router.post("/usuarios", usuarioStore);
router.put("/usuarios/:id", usuarioUpdate);
router.delete("/usuarios/:id", usuarioDestroy);

/**
<<<<<<< HEAD
 * =========================
 * GASTOS
 * =========================
 */
router.get("/gastos", authenticateToken, gastoIndex);
router.get("/gastos/:id", authenticateToken, gastoShow);
router.post("/gastos", authenticateToken, gastoStore);
router.put("/gastos/:id", authenticateToken, gastoUpdate);
router.delete("/gastos/:id", authenticateToken, gastoDestroy);

// Gastos por usuario
router.get("/usuarios/:userId/gastos", authenticateToken, gastoIndex);

/**
 * =========================
 * INGRESOS
 * =========================
 */
router.get("/ingresos", authenticateToken, ingresoIndex);
router.get("/ingresos/:id", authenticateToken, ingresoShow);
router.post("/ingresos", authenticateToken, ingresoStore);
router.put("/ingresos/:id", authenticateToken, ingresoUpdate);
router.delete("/ingresos/:id", authenticateToken, ingresoDestroy);

// Ingresos por usuario
router.get("/usuarios/:userId/ingresos", authenticateToken, ingresoIndex);

/**
 * =========================
 * METAS DE AHORRO
 * =========================
 */
router.get("/metas", authenticateToken, metaIndex);
router.get("/metas/:id", authenticateToken, metaShow);
router.post("/metas", authenticateToken, metaStore);
router.put("/metas/:id", authenticateToken, metaUpdate);
router.delete("/metas/:id", authenticateToken, metaDestroy);

// Metas por usuario
router.get("/usuarios/:userId/metas", authenticateToken, metaIndex);

/**
 * =========================
 * MOVIMIENTOS DE AHORRO
 * =========================
 */
router.get("/movimientos", authenticateToken, movIndex);
router.get("/movimientos/:id", authenticateToken, movShow);
router.post("/movimientos", authenticateToken, movStore);
router.put("/movimientos/:id", authenticateToken, movUpdate);
router.delete("/movimientos/:id", authenticateToken, movDestroy);

// Movimientos por meta
router.get(
  "/metas/:metaId/movimientos",
  authenticateToken,
  movIndex
);

/**
 * =========================
 * MENSAJES DE CHAT
 * =========================
=======
 * 💸 GASTOS
 */
router.get('/gastos', authenticateToken, gastoIndex);
router.get('/gastos/:id', authenticateToken, gastoShow);
router.post('/gastos', authenticateToken, gastoStore);
router.put('/gastos/:id', authenticateToken, gastoUpdate);
router.delete('/gastos/:id', authenticateToken, gastoDestroy);

router.get('/usuarios/:userId/gastos', authenticateToken, gastoIndex);

/**
 * 💰 INGRESOS
 */
router.get('/ingresos', authenticateToken, ingresoIndex);
router.get('/ingresos/:id', authenticateToken, ingresoShow);
router.post('/ingresos', authenticateToken, ingresoStore);
router.put('/ingresos/:id', authenticateToken, ingresoUpdate);
router.delete('/ingresos/:id', authenticateToken, ingresoDestroy);

router.get('/usuarios/:userId/ingresos', authenticateToken, ingresoIndex);

/**
 * 🎯 METAS DE AHORRO
 */
router.get('/metas', authenticateToken, metaIndex);
router.get('/metas/:id', authenticateToken, metaShow);
router.post('/metas', authenticateToken, metaStore);
router.put('/metas/:id', authenticateToken, metaUpdate);
router.delete('/metas/:id', authenticateToken, metaDestroy);

router.get('/usuarios/:userId/metas', authenticateToken, metaIndex);

/**
 * 🔁 MOVIMIENTOS DE AHORRO
 */
router.get('/movimientos', authenticateToken, movIndex);
router.get('/movimientos/:id', authenticateToken, movShow);
router.post('/movimientos', authenticateToken, movStore);
router.put('/movimientos/:id', authenticateToken, movUpdate);
router.delete('/movimientos/:id', authenticateToken, movDestroy);

router.get('/metas/:metaId/movimientos', authenticateToken, movIndex);

/**
 * 💬 CHAT
>>>>>>> f215952b8e724f34938bd8a1eee69e82753c1b78
 */
router.get("/mensajes", authenticateToken, chatIndex);
router.get("/mensajes/:id", authenticateToken, chatShow);
router.post("/mensajes", authenticateToken, chatStore);
router.delete("/mensajes/:id", authenticateToken, chatDestroy);

<<<<<<< HEAD
// Mensajes por usuario
router.get(
  "/usuarios/:userId/mensajes",
  authenticateToken,
  chatIndex
);

/**
 * =========================
 * CONSEJOS FINANCIEROS
 * =========================
 */
router.get("/consejos", authenticateToken, consejoIndex);
router.get("/consejos/:id", authenticateToken, consejoShow);
router.post("/consejos", authenticateToken, consejoStore);
router.delete("/consejos/:id", authenticateToken, consejoDestroy);

// Consejos por usuario
router.get(
  "/usuarios/:userId/consejos",
  authenticateToken,
  consejoIndex
);
=======
router.get('/usuarios/:userId/mensajes', authenticateToken, chatIndex);

/**
 * 💡 CONSEJOS FINANCIEROS
 */
router.get('/consejos', authenticateToken, consejoIndex);
router.get('/consejos/:id', authenticateToken, consejoShow);
router.post('/consejos', authenticateToken, consejoStore);
router.delete('/consejos/:id', authenticateToken, consejoDestroy);

router.get('/usuarios/:userId/consejos', authenticateToken, consejoIndex);
>>>>>>> f215952b8e724f34938bd8a1eee69e82753c1b78

/**
 * =========================
 * DASHBOARD
 * =========================
 */
router.get(
  "/dashboard/summary",
  authenticateToken,
  getDashboardSummary
);

/**
<<<<<<< HEAD
 * =========================
 * RUTA BASE
 * =========================
 */
router.get("/", (req, res) => {
  res.json({ message: "Bienvenido a la API Finanzas Chatbot" });
=======
 * 🏠 RUTA BASE
 */
router.get('/', (req, res) => {
  res.json({
    message: 'SmartFin Backend activo 🚀',
    status: 'OK',
  });
>>>>>>> f215952b8e724f34938bd8a1eee69e82753c1b78
});

export default router;
