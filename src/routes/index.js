import { Router } from "express";

import authRoutes from "./auth.routes.js";
import usuariosRoutes from "./usuarios.routes.js";
import gastosRoutes from "./gastos.routes.js";
import ingresosRoutes from "./ingresos.routes.js";
import metasRoutes from "./metas.routes.js";
import movimientosRoutes from "./movimientos.routes.js";
import mensajesRoutes from "./mensajes.routes.js";
import consejosRoutes from "./consejos.routes.js";
import dashboardRoutes from "./dashboard.routes.js";

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
