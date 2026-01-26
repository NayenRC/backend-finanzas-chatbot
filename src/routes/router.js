/**
 * Definición de Rutas - API de Finanzas
 */

import { Router } from 'express';

// Auth
import AuthController from '../controllers/AuthController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
// Dashboard
import { getDashboardSummary } from "../controllers/DashboardController.js";
import authMiddleware from "../middlewares/authMiddleware.js";


// Usuarios
import {
  index as usuarioIndex,
  show as usuarioShow,
  store as usuarioStore,
  update as usuarioUpdate,
  destroy as usuarioDestroy,
} from '../controllers/UsuarioController.js';

// Gastos
import {
  index as gastoIndex,
  show as gastoShow,
  store as gastoStore,
  update as gastoUpdate,
  destroy as gastoDestroy,
} from '../controllers/GastoController.js';

// Ingresos
import {
  index as ingresoIndex,
  show as ingresoShow,
  store as ingresoStore,
  update as ingresoUpdate,
  destroy as ingresoDestroy,
} from '../controllers/IngresoController.js';

// Metas de Ahorro
import {
  index as metaIndex,
  show as metaShow,
  store as metaStore,
  update as metaUpdate,
  destroy as metaDestroy,
} from '../controllers/MetaAhorroController.js';

// Movimientos de ahorro 
import {
  index as movIndex,
  show as movShow,
  store as movStore,
  update as movUpdate,
  destroy as movDestroy,
} from '../controllers/MovimientoAhorroController.js';

// Chat mensajes 
import {
  index as chatIndex,
  show as chatShow,
  store as chatStore,
  destroy as chatDestroy,
} from '../controllers/ChatMensajeController.js';

// Consejo financiero
import {
  index as consejoIndex,
  show as consejoShow,
  store as consejoStore,
  destroy as consejoDestroy,
} from '../controllers/ConsejoFinancieroController.js';

const router = Router();

/**
 * AUTENTICACIÓN
 */
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.get('/profile', authenticateToken, AuthController.getProfile);


// --- SECCIÓN ELIMINADA: Rutas de Artículos ---


/**
 * USUARIOS
 */
router.get('/usuarios', usuarioIndex);
router.get('/usuarios/:id', usuarioShow);
router.post('/usuarios', usuarioStore);
router.put('/usuarios/:id', usuarioUpdate);
router.delete('/usuarios/:id', usuarioDestroy);

/**
 * GASTOS
 */
router.get('/gastos', authenticateToken, gastoIndex); // Recomendado proteger también la lectura
router.get('/gastos/:id', authenticateToken, gastoShow);
router.post('/gastos', authenticateToken, gastoStore); // <--- ¡AQUÍ ESTÁ LA CLAVE!
router.put('/gastos/:id', authenticateToken, gastoUpdate);
router.delete('/gastos/:id', authenticateToken, gastoDestroy);

// filtrar gastos por usuario
router.get('/usuarios/:userId/gastos', gastoIndex);

/**
 * INGRESOS
 */
router.get('/ingresos', ingresoIndex);
router.get('/ingresos/:id', ingresoShow);
router.post('/ingresos', ingresoStore);
router.put('/ingresos/:id', ingresoUpdate);
router.delete('/ingresos/:id', ingresoDestroy);

// filtrar ingresos por usuario
router.get('/usuarios/:userId/ingresos', ingresoIndex);

/**
 * METAS DE AHORRO
 */
router.get('/metas', metaIndex);
router.get('/metas/:id', metaShow);
router.post('/metas', metaStore);
router.put('/metas/:id', metaUpdate);
router.delete('/metas/:id', metaDestroy);

// filtrar metas por usuario
router.get('/usuarios/:userId/metas', metaIndex);

/**
 * MOVIMIENTOS DE AHORRO
 */
router.get('/movimientos', movIndex);
router.get('/movimientos/:id', movShow);
router.post('/movimientos', movStore);
router.put('/movimientos/:id', movUpdate);
router.delete('/movimientos/:id', movDestroy);

// Movimientos filtrados por meta
router.get('/metas/:metaId/movimientos', movIndex);


/**
 * Mensajes de Chat
 */
router.get('/mensajes', chatIndex);
router.get('/mensajes/:id', chatShow);
router.post('/mensajes', authenticateToken, chatStore);
router.delete('/mensajes/:id', chatDestroy);

// Filtrar mensajes de un usuario
router.get('/usuarios/:userId/mensajes', chatIndex);


/**
 * Consejos Financieros
 */
router.get('/consejos', consejoIndex);
router.get('/consejos/:id', consejoShow);
router.post('/consejos', consejoStore);
router.delete('/consejos/:id', consejoDestroy);

// Consejos filtrados por usuario
router.get('/usuarios/:userId/consejos', consejoIndex);

// Dashboard Summary
router.get(
  "/dashboard/summary",
  authMiddleware,
  getDashboardSummary
);

/**
 * RUTA BASE
 */
router.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API Finanzas Chatbot' });
});

export default router;