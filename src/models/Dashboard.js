import db from '../config/db.js';

class Dashboard {
    /**
     * Obtener resumen de ingresos para un usuario
     */
    static async getIncomeSummary(userId, filters = {}) {
        const { startDate, endDate } = filters;

        let query = db('ingresos')
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

        let query = db('gastos')
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

        let query = db('gastos')
            .leftJoin('categorias', 'gastos.categoria_id', 'categorias.id_categoria')
            .where('gastos.user_id', userId)
            .select(
                'categorias.nombre as categoria',
                db.raw('COUNT(*) as cantidad'),
                db.raw('SUM(gastos.monto) as total')
            )
            .groupBy('categorias.id_categoria', 'categorias.nombre');

        if (startDate) {
            query = query.where('gastos.fecha', '>=', startDate);
        }

        if (endDate) {
            query = query.where('gastos.fecha', '<=', endDate);
        }

        return await query;
    }

}

export default Dashboard;
