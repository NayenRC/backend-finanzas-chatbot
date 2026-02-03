import { Router } from "express";

import authRoutes from "./authRoutes.js";
import usuariosRoutes from "./usuariosRoutes.js";
import gastosRoutes from "./gastosRoutes.js";
import ingresosRoutes from "./ingresosRoutes.js";
import metasRoutes from "./metasRoutes.js";
import movimientosRoutes from "./movimientosRoutes.js";
import mensajesRoutes from "./mensajesRoutes.js";
import consejosRoutes from "./consejosRoutes.js";
import categoriasRoutes from "./categoriasRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import chatRoutes from "./chatRoutes.js";

import AuthController from "../controllers/AuthController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import AuthController from "../controllers/AuthController.js";

const router = Router();

/* =====================
   RUTAS PÚBLICAS
===================== */
router.use("/auth", authRoutes);

/* =====================
   RUTAS PROTEGIDAS
===================== */
router.use("/usuarios", authenticateToken, usuariosRoutes);
router.use("/gastos", authenticateToken, gastosRoutes);
router.use("/ingresos", authenticateToken, ingresosRoutes);
router.use("/metas", authenticateToken, metasRoutes);
router.use("/movimientos", authenticateToken, movimientosRoutes);
router.use("/mensajes", authenticateToken, mensajesRoutes);
router.use("/chat", authenticateToken, chatRoutes);
router.use("/consejos", authenticateToken, consejosRoutes);
router.use("/categorias", authenticateToken, categoriasRoutes);
router.use("/dashboard", authenticateToken, dashboardRoutes);

/* =====================
   PROFILE
===================== */
router.get("/profile", authenticateToken, AuthController.getProfile);

/* =====================
   HEALTHCHECK
===================== */
router.get("/", (req, res) => {
  res.json({ message: "Bienvenido a la API Finanzas Chatbot" });
});

export default router;
