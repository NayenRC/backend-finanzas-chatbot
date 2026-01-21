import MetaAhorro from '../models/MetaAhorro.js';

export const index = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId) {
      // Metas de un usuario específico
      const metasPorUsuario = await MetaAhorro.findByUser(userId);
      return res.json(metasPorUsuario);
    }

    // Todas las metas
    const metas = await MetaAhorro.all();
    res.json(metas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const show = async (req, res) => {
  try {
    const { id } = req.params;
    const meta = await MetaAhorro.find(id);

    if (!meta) {
      return res.status(404).json({ message: 'Meta de ahorro no encontrada' });
    }

    res.json(meta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const store = async (req, res) => {
  try {
    const data = req.body;

    // Validación mínima
    if (!data.user_id || !data.nombre || !data.monto_objetivo) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const newMeta = await MetaAhorro.create(data);
    res.status(201).json(newMeta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updatedMeta = await MetaAhorro.update(id, data);

    if (!updatedMeta) {
      return res.status(404).json({ message: 'Meta de ahorro no encontrada' });
    }

    res.json(updatedMeta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    await MetaAhorro.delete(id);
    res.json({ message: 'Meta de ahorro eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
