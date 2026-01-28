import Dashboard from "../models/Dashboard.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id || req.user.user_id;

    // 1. Obtener sumas desde el modelo Dashboard
    const incomeSummary = await Dashboard.getIncomeSummary(userId);
    const expenseSummary = await Dashboard.getExpenseSummary(userId);
    const expensesByCategory = await Dashboard.getExpensesByCategory(userId);

    const incomeTotal = Number(incomeSummary?.total_monto || 0);
    const expenseTotal = Number(expenseSummary?.total_monto || 0);

    // 2. Responder con el formato que espera el Frontend
    res.json({
      income: incomeTotal,
      expenses: expenseTotal,
      balance: incomeTotal - expenseTotal,
      expensesByCategory: expensesByCategory.map((g) => ({
        category: g.categoria,
        amount: Number(g.total || 0),
      })),
    });
  } catch (error) {
    console.error("❌ DASHBOARD ERROR:", error);
    res.status(500).json({ message: "Error al cargar el dashboard" });
  }
};
