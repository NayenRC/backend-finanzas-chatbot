/**
 * Utilidad para formatear respuestas del bot
 * Similar al formato mostrado en Telegram
 */

/**
 * Formatear un reporte de gastos
 */
export function formatearReporteGastos(datos) {
    const { titulo, totalGastado, desglosePorCategoria, consejo } = datos;

    const emojis = {
        'Comida': '🍔',
        'Salud': '🏥',
        'Transporte': '🚗',
        'Hogar': '🏠',
        'Entretenimiento': '🎮',
        'Educación': '📚',
    };

    let respuesta = `📊 **${titulo}** 📊\n\n`;
    respuesta += `**Total Gastado: $${totalGastado.toLocaleString('es-CL')}**\n\n`;
    respuesta += `**Desglose por Categoría:**\n\n`;

    desglosePorCategoria.forEach((cat, index) => {
        const emoji = emojis[cat.categoria] || '💰';
        respuesta += `${index + 1}. ${emoji} **${cat.categoria}**\n`;
        respuesta += `   Total: $${cat.total.toLocaleString('es-CL')}\n`;
        respuesta += `   Transacciones: ${cat.transacciones}\n\n`;
    });

    if (consejo) {
        respuesta += `💡 **Consejo:** ${consejo}\n\n`;
    }

    respuesta += `📅 **Ver Mes Anterior**\n`;
    respuesta += `📊 **Gráfico de Torta**`;

    return respuesta;
}

/**
 * Formatear confirmación de gasto registrado
 */
export function formatearConfirmacionGasto(gasto) {
    const emojis = {
        'Comida': '🍔',
        'Salud': '🏥',
        'Transporte': '🚗',
        'Hogar': '🏠',
    };

    const emoji = emojis[gasto.categoria] || '💰';

    return `✅ **Gasto Registrado**\n\n` +
        `${emoji} ${gasto.descripcion}\n` +
        `💵 Monto: $${gasto.monto.toLocaleString('es-CL')}\n` +
        `📁 Categoría: ${gasto.categoria}\n` +
        `📅 Fecha: ${gasto.fecha}`;
}

/**
 * Formatear confirmación de ingreso registrado
 */
export function formatearConfirmacionIngreso(ingreso) {
    return `✅ **Ingreso Registrado**\n\n` +
        `💵 Monto: $${ingreso.monto.toLocaleString('es-CL')}\n` +
        `📝 Descripción: ${ingreso.descripcion}\n` +
        `📁 Categoría: ${ingreso.categoria}\n` +
        `📅 Fecha: ${ingreso.fecha}`;
}

/**
 * Formatear mensaje de bienvenida
 */
export function formatearBienvenida() {
    return `¡Hola! 👋 Soy **SmartFin**, tu asistente financiero.\n\n` +
        `Puedo ayudarte a:\n` +
        `💰 Registrar gastos e ingresos\n` +
        `📊 Consultar tus finanzas\n` +
        `📈 Ver reportes y estadísticas\n\n` +
        `¿En qué te puedo ayudar hoy?`;
}

/**
 * Calcular porcentaje de una categoría
 */
export function calcularPorcentaje(monto, total) {
    return Math.round((monto / total) * 100);
}

/**
 * Generar consejo financiero basado en gastos
 */
export function generarConsejo(desglosePorCategoria, totalGastado) {
    if (!desglosePorCategoria || desglosePorCategoria.length === 0) {
        return null;
    }

    // Encontrar la categoría con mayor gasto
    const categoriaMaxima = desglosePorCategoria.reduce((max, cat) =>
        cat.total > max.total ? cat : max
    );

    const porcentaje = calcularPorcentaje(categoriaMaxima.total, totalGastado);

    if (porcentaje > 50) {
        return `Tu gasto en ${categoriaMaxima.categoria} es el ${porcentaje}% del total. ¡Intenta reducirlo el próximo mes!`;
    } else if (porcentaje > 30) {
        return `${categoriaMaxima.categoria} representa el ${porcentaje}% de tus gastos. Considera si puedes optimizar en esta área.`;
    }

    return `Tus gastos están bien distribuidos. ¡Sigue así! 👍`;
}

export default {
    formatearReporteGastos,
    formatearConfirmacionGasto,
    formatearConfirmacionIngreso,
    formatearBienvenida,
    calcularPorcentaje,
    generarConsejo,
};
