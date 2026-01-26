import Ingreso from "../models/Ingreso.js";
import Gasto from "../models/Gasto.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // Total ingresos
    const ingresos = await Ingreso.sum("monto", {
      where: { usuario_id: userId },
    });

    // Total gastos
    const gastos = await Gasto.sum("monto", {
      where: { usuario_id: userId },
    });

    // Gastos por categoría
    const gastosPorCategoria = await Gasto.findAll({
      where: { usuario_id: userId },
      attributes: [
        "categoria",
        [
          Gasto.sequelize.fn("SUM", Gasto.sequelize.col("monto")),
          "amount",
        ],
      ],
      group: ["categoria"],
    });

    res.json({
      income: ingresos || 0,
      expenses: gastos || 0,
      balance: (ingresos || 0) - (gastos || 0),
      expensesByCategory: gastosPorCategoria.map((g) => ({
        category: g.categoria,
        amount: Number(g.dataValues.amount),
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error dashboard" });
  }
};
