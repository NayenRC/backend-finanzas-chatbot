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
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/usuarios", usuariosRoutes);
router.use("/gastos", gastosRoutes);
router.use("/ingresos", ingresosRoutes);
router.use("/metas", metasRoutes);
router.use("/movimientos", movimientosRoutes);
router.use("/mensajes", mensajesRoutes); // Historial (opcional)
router.use("/chat", chatRoutes); // <--- NUEVO ENDPOINT IA
router.use("/consejos", consejosRoutes);
router.use("/categorias", categoriasRoutes);
router.use("/dashboard", dashboardRoutes);

// router.get("/", ...

router.get("/", (req, res) => {
  res.json({ message: "Bienvenido a la API Finanzas Chatbot" });
});

export default router;
