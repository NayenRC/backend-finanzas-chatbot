import MetaAhorro from '../models/MetaAhorro.js';
import MovimientoAhorro from '../models/MovimientoAhorro.js';

class MetaAhorroService {

  /* ===============================
     Crear meta de ahorro
  =============================== */
  async crearMeta(userId, data) {
    const montoObjetivo = Number(data.monto_objetivo);

    if (!userId || !data.nombre || isNaN(montoObjetivo)) {
      throw new Error('Datos inválidos para crear la meta');
    }

    const meta = await MetaAhorro.query().insert({
      user_id: userId,
      nombre: data.nombre,
      monto_objetivo: montoObjetivo,
      monto_actual: 0,
    });

    return meta;
  }


  /* ===============================
     Registrar movimiento de ahorro
  =============================== */
  async agregarMovimiento(metaId, userId, monto, fecha) {
    const meta = await MetaAhorro.findByIdAndUser(metaId, userId);

    if (!meta) {
      throw new Error('Meta de ahorro no encontrada');
    }

    const montoMovimiento = Number(monto);
    if (isNaN(montoMovimiento) || montoMovimiento <= 0) {
      throw new Error('Monto de movimiento inválido');
    }

    // 1️⃣ Crear movimiento
    const movimiento = await MovimientoAhorro.create({
      meta_id: metaId,
      monto: montoMovimiento,
      fecha
    });

    // 2️⃣ Actualizar monto actual de la meta
    const nuevoMonto = Number(meta.monto_actual) + montoMovimiento;

    await MetaAhorro.updateByUser(metaId, userId, {
      monto_actual: nuevoMonto
    });

    return {
      movimiento,
      progreso: {
        actual: nuevoMonto,
        objetivo: meta.monto_objetivo,
        completada: nuevoMonto >= meta.monto_objetivo
      }
    };
  }
}

export default new MetaAhorroService();
