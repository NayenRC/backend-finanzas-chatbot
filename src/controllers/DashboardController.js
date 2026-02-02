import Dashboard from "../models/Dashboard.js";

export const getDashboardResumen = async (req, res) => {
  try {
    const userId = req.user.id;

    const incomeSummary = await Dashboard.getIncomeSummary(userId);
    const expenseSummary = await Dashboard.getExpenseSummary(userId);
    const porCategoria = await Dashboard.getExpensesByCategory(userId);

    const ingresos = Number(incomeSummary?.total_monto || 0);
    const gastos = Number(expenseSummary?.total_monto || 0);

    res.json({
      ingresos,
      gastos,
      balance: ingresos - gastos,
      por_categoria: porCategoria.map((item) => ({
        nombre: item.categoria,
        total: Number(item.total || 0),
      })),
    });
  } catch (error) {
    console.error("❌ Dashboard resumen error:", error);
    res.status(500).json({ message: "Error obteniendo resumen del dashboard" });
  }
};
