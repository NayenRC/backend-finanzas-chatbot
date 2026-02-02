import MetaAhorro from '../models/MetaAhorro.js';
import MetaAhorroService from '../services/metaAhorroService.js';

export const index = async (req, res) => {
  try {
    const userId = req.user.id;


    if (userId) {
      const metas = await MetaAhorro.findByUser(userId);
      return res.json(metas);
    }

    const metas = await MetaAhorro.all();
    res.json(metas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const show = async (req, res) => {
  try {
    const userId = req.user.id || req.user.user_id;
    const { id } = req.params;

    const meta = await MetaAhorro.findByIdAndUser(id, userId);
    if (!meta) {
      return res.status(404).json({ message: 'Meta no encontrada' });
    }

    res.json(meta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const store = async (req, res) => {
  try {
    const userId = req.user.id || req.user.user_id;
    const meta = await MetaAhorroService.crearMeta(userId, req.body);
    res.status(201).json(meta);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const userId = req.user.id || req.user.user_id;
    const { id } = req.params;

    const updated = await MetaAhorro.updateByUser(id, userId, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Meta no encontrada' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const destroy = async (req, res) => {
  try {
    const userId = req.user.id || req.user.user_id;
    const { id } = req.params;

    const deleted = await MetaAhorro.deleteByUser(id, userId);
    if (!deleted) {
      return res.status(404).json({ message: 'Meta no encontrada' });
    }

    res.json({ message: 'Meta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const MetaAhorroController = {
  index,
  show,
  store,
  update,
  destroy,
};

export default MetaAhorroController;
