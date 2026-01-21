import MovimientoAhorro from '../models/MovimientoAhorro.js';

export const index = async (req, res) => {
  try {
    const { metaId } = req.params;

    if (metaId) {
      // Movimientos de una meta específica
      const movimientosPorMeta = await MovimientoAhorro.findByMeta(metaId);
      return res.json(movimientosPorMeta);
    }

    // Todos los movimientos
    const movimientos = await MovimientoAhorro.all();
    res.json(movimientos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const show = async (req, res) => {
  try {
    const { id } = req.params;
    const movimiento = await MovimientoAhorro.find(id);

    if (!movimiento) {
      return res.status(404).json({ message: 'Movimiento de ahorro no encontrado' });
    }

    res.json(movimiento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const store = async (req, res) => {
  try {
    const data = req.body;

    // Asegura campos mínimos
    if (!data.meta_id || !data.monto || !data.fecha) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const newMovimiento = await MovimientoAhorro.create(data);
    res.status(201).json(newMovimiento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updatedMovimiento = await MovimientoAhorro.update(id, data);

    if (!updatedMovimiento) {
      return res.status(404).json({ message: 'Movimiento de ahorro no encontrado' });
    }

    res.json(updatedMovimiento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    await MovimientoAhorro.delete(id);
    res.json({ message: 'Movimiento de ahorro eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
