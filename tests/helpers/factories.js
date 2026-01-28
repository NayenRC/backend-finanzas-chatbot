/**
 * Factories de Datos de Prueba
 * 
 * Funciones factory para crear datos de prueba de manera consistente
 * con datos realistas en español
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Crear un usuario de prueba
 */
export function createUserData(overrides = {}) {
    return {
        nombre: 'Usuario de Prueba',
        email: `test-${uuidv4()}@example.com`,
        password: 'hashedPassword123',
        telegram_id: Math.floor(Math.random() * 1000000),
        ...overrides,
    };
}

/**
 * Crear un gasto de prueba con datos realistas
 */
export function createGastoData(userId, overrides = {}) {
    const categorias = {
        'Comida': ['Almuerzo en restaurante', 'Supermercado', 'Delivery de comida', 'Café', 'Desayuno'],
        'Salud': ['Farmacia', 'Consulta médica', 'Medicamentos', 'Gimnasio'],
        'Transporte': ['Uber', 'Combustible', 'Estacionamiento', 'Peaje', 'Mantenimiento auto'],
        'Hogar': ['Alquiler', 'Servicios', 'Reparaciones', 'Decoración']
    };

    const categoria = overrides.categoria || 'Comida';
    const descripciones = categorias[categoria] || ['Gasto de prueba'];
    const descripcion = descripciones[Math.floor(Math.random() * descripciones.length)];

    return {
        user_id: userId,
        monto: 5000,
        descripcion: descripcion,
        categoria: categoria,
        fecha: new Date().toISOString().split('T')[0],
        ...overrides,
    };
}

/**
 * Crear un ingreso de prueba con datos realistas
 */
export function createIngresoData(userId, overrides = {}) {
    const descripciones = {
        'Salario': 'Sueldo mensual',
        'Freelance': 'Proyecto freelance',
        'Inversiones': 'Dividendos',
        'Otros': 'Ingreso extra'
    };

    const categoria = overrides.categoria || 'Salario';
    const descripcion = descripciones[categoria] || 'Ingreso de prueba';

    return {
        user_id: userId,
        monto: 50000,
        descripcion: descripcion,
        categoria: categoria,
        fecha: new Date().toISOString().split('T')[0],
        ...overrides,
    };
}

/**
 * Crear una meta de ahorro de prueba
 */
export function createMetaAhorroData(userId, overrides = {}) {
    const metas = [
        'Vacaciones',
        'Fondo de emergencia',
        'Compra de auto',
        'Renovación de casa',
        'Educación'
    ];

    const nombre = metas[Math.floor(Math.random() * metas.length)];

    return {
        user_id: userId,
        nombre: nombre,
        monto_objetivo: 100000,
        monto_actual: 0,
        fecha_limite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ...overrides,
    };
}

/**
 * Crear un mensaje de chat de prueba
 */
export function createChatMensajeData(userId, overrides = {}) {
    return {
        user_id: userId,
        mensaje: 'Mensaje de prueba',
        respuesta: 'Respuesta de prueba',
        tipo: 'CONSULTA',
        ...overrides,
    };
}

/**
 * Crear múltiples gastos de prueba con datos realistas
 */
export function createMultipleGastos(userId, count = 3, overrides = {}) {
    const gastos = [
        { monto: 1200000, descripcion: 'Almuerzo en restaurante', categoria: 'Comida' },
        { monto: 800000, descripcion: 'Farmacia', categoria: 'Salud' },
        { monto: 300000, descripcion: 'Uber', categoria: 'Transporte' },
        { monto: 200000, descripcion: 'Café', categoria: 'Comida' },
        { monto: 150000, descripcion: 'Estacionamiento', categoria: 'Transporte' },
    ];

    return Array.from({ length: count }, (_, i) => {
        const gastoTemplate = gastos[i % gastos.length];
        return createGastoData(userId, {
            ...gastoTemplate,
            ...overrides,
        });
    });
}

/**
 * Crear múltiples ingresos de prueba
 */
export function createMultipleIngresos(userId, count = 3, overrides = {}) {
    const ingresos = [
        { monto: 2500000, descripcion: 'Sueldo mensual', categoria: 'Salario' },
        { monto: 500000, descripcion: 'Proyecto freelance', categoria: 'Freelance' },
        { monto: 150000, descripcion: 'Dividendos', categoria: 'Inversiones' },
    ];

    return Array.from({ length: count }, (_, i) => {
        const ingresoTemplate = ingresos[i % ingresos.length];
        return createIngresoData(userId, {
            ...ingresoTemplate,
            ...overrides,
        });
    });
}

/**
 * Crear un reporte de gastos realista (como el de la imagen)
 */
export function createReporteGastos(userId) {
    const fecha = new Date();
    const mes = fecha.toLocaleString('es', { month: 'long' });
    const anio = fecha.getFullYear();

    return {
        titulo: `Reporte de Gastos - ${mes.charAt(0).toUpperCase() + mes.slice(1)} ${anio}`,
        gastos: [
            createGastoData(userId, {
                monto: 1200000,
                descripcion: 'Almuerzo en restaurante',
                categoria: 'Comida',
                fecha: `${anio}-${String(fecha.getMonth() + 1).padStart(2, '0')}-15`
            }),
            createGastoData(userId, {
                monto: 800000,
                descripcion: 'Consulta médica',
                categoria: 'Salud',
                fecha: `${anio}-${String(fecha.getMonth() + 1).padStart(2, '0')}-10`
            }),
            createGastoData(userId, {
                monto: 300000,
                descripcion: 'Uber',
                categoria: 'Transporte',
                fecha: `${anio}-${String(fecha.getMonth() + 1).padStart(2, '0')}-20`
            }),
            createGastoData(userId, {
                monto: 200000,
                descripcion: 'Servicios del hogar',
                categoria: 'Hogar',
                fecha: `${anio}-${String(fecha.getMonth() + 1).padStart(2, '0')}-05`
            }),
        ],
        totalGastado: 2500000,
        desglosePorCategoria: [
            { categoria: 'Comida', total: 1200000, transacciones: 15 },
            { categoria: 'Salud', total: 800000, transacciones: 5 },
            { categoria: 'Transporte', total: 300000, transacciones: 10 },
            { categoria: 'Hogar', total: 200000, transacciones: 2 },
        ]
    };
}

export default {
    createUserData,
    createGastoData,
    createIngresoData,
    createMetaAhorroData,
    createChatMensajeData,
    createMultipleGastos,
    createMultipleIngresos,
    createReporteGastos,
};
