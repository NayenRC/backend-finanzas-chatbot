import MovimientoAhorro from '../models/MovimientoAhorro.js';
import MetaAhorroService from '../services/metaAhorroService.js';

export const index = async (req, res) => {
  try {
    const { metaId } = req.params;

    if (metaId) {
      const movimientos = await MovimientoAhorro.findByMeta(metaId);
      return res.json(movimientos);
    }

    const movimientos = await MovimientoAhorro.all();
    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const show = async (req, res) => {
  try {
    const { id } = req.params;
    const movimiento = await MovimientoAhorro.find(id);

    if (!movimiento) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }

    res.json(movimiento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const store = async (req, res) => {
  try {
    const userId = req.user.id || req.user.user_id;
    const { meta_id, monto, fecha } = req.body;

    const result = await MetaAhorroService.agregarMovimiento(
      meta_id,
      userId,
      monto,
      fecha
    );

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await MovimientoAhorro.update(id, req.body);

    if (!updated) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    await MovimientoAhorro.delete(id);
    res.json({ message: 'Movimiento eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
