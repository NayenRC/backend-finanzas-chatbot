import db from '../config/db.js';

class Dashboard {
    /**
     * Obtener resumen de ingresos para un usuario
     */
    static async getIncomeSummary(userId, filters = {}) {
        const { startDate, endDate } = filters;

        let query = db('ingreso')
            .where('user_id', userId)
            .select(
                db.raw('COUNT(*) as total_ingresos'),
                db.raw('SUM(monto) as total_monto')
            );

        if (startDate) {
            query = query.where('fecha', '>=', startDate);
        }

        if (endDate) {
            query = query.where('fecha', '<=', endDate);
        }

        const [summary] = await query;
        return summary;
    }

    /**
     * Obtener resumen de gastos para un usuario
     */
    static async getExpenseSummary(userId, filters = {}) {
        const { startDate, endDate } = filters;

        let query = db('gasto')
            .where('user_id', userId)
            .select(
                db.raw('COUNT(*) as total_gastos'),
                db.raw('SUM(monto) as total_monto')
            );

        if (startDate) {
            query = query.where('fecha', '>=', startDate);
        }

        if (endDate) {
            query = query.where('fecha', '<=', endDate);
        }

        const [summary] = await query;
        return summary;
    }

    /**
     * Obtener gastos agrupados por categoría
     */
    static async getExpensesByCategory(userId, filters = {}) {
        const { startDate, endDate } = filters;

        let query = db('gasto')
            .leftJoin('categorias', 'gasto.categoria_id', 'categorias.id_categoria')
            .where('gasto.user_id', userId)
            .select(
                'categorias.nombre as categoria',
                db.raw('COUNT(*) as cantidad'),
                db.raw('SUM(gasto.monto) as total')
            )
            .groupBy('categorias.id_categoria', 'categorias.nombre');

        if (startDate) {
            query = query.where('gasto.fecha', '>=', startDate);
        }

        if (endDate) {
            query = query.where('gasto.fecha', '<=', endDate);
        }

        return await query;
    }
}

export default Dashboard;
