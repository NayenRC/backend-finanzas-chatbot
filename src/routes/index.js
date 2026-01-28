import { Router } from "express";

import authRoutes from "./authRoutes.js";
import usuariosRoutes from "./usuariosRoutes.js";
import gastosRoutes from "./gastosRoutes.js";
import ingresosRoutes from "./ingresosRoutes.js";
import metasRoutes from "./metasRoutes.js";
import movimientosRoutes from "./movimientosRoutes.js";
import mensajesRoutes from "./mensajesRoutes.js";
import consejosRoutes from "./consejosRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/usuarios", usuariosRoutes);
router.use("/gastos", gastosRoutes);
router.use("/ingresos", ingresosRoutes);
router.use("/metas", metasRoutes);
router.use("/movimientos", movimientosRoutes);
router.use("/mensajes", mensajesRoutes);
router.use("/consejos", consejosRoutes);
router.use("/dashboard", dashboardRoutes);

router.get("/", (req, res) => {
  res.json({ message: "Bienvenido a la API Finanzas Chatbot" });
});

export default router;
