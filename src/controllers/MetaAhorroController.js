import MetaAhorro from '../models/MetaAhorro.js';

export const index = async (req, res) => {
  try {
    const userIdParam = req.params.userId;
    const idToSearch = userIdParam || (req.user ? (req.user.id || req.user.user_id) : null);

    if (idToSearch) {
      // Metas de un usuario específico
      const metasPorUsuario = await MetaAhorro.findByUser(idToSearch);
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
    const userId = req.user.id || req.user.user_id;
    const { id } = req.params;
    const meta = await MetaAhorro.findByIdAndUser(id, userId);

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
    // Asignar usuario si está disponible
    if (req.user && (req.user.id || req.user.user_id)) {
      data.user_id = req.user.id || req.user.user_id;
    }

    // Validación mínima
    // Convertir a número si es string
    data.monto_objetivo = parseFloat(data.monto_objetivo);
    data.monto_actual = parseFloat(data.monto_actual || 0);

    if (!data.user_id || !data.nombre || isNaN(data.monto_objetivo)) {
      return res.status(400).json({ message: 'Faltan campos obligatorios o monto inválido' });
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
    const userId = req.user.id || req.user.user_id;
    const { id } = req.params;
    const data = req.body;

    const updatedMeta = await MetaAhorro.updateByUser(id, userId, data);

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
    const userId = req.user.id || req.user.user_id;
    const { id } = req.params;
    const deleted = await MetaAhorro.deleteByUser(id, userId);

    if (!deleted) {
      return res.status(404).json({ message: 'Meta de ahorro no encontrada' });
    }

    res.json({ message: 'Meta de ahorro eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
