import ConsejoFinanciero from '../models/ConsejoFinanciero.js';

export const index = async (req, res) => {
  try {
    const idToSearch = req.params.userId || (req.user ? (req.user.id || req.user.user_id) : null);

    if (idToSearch) {
      const consejosUsuario = await ConsejoFinanciero.findByUser(idToSearch);
      return res.json(consejosUsuario);
    }

    const consejos = await ConsejoFinanciero.all();
    res.json(consejos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const show = async (req, res) => {
  try {
    const userId = req.user.id || req.user.user_id;
    const { id } = req.params;
    const consejo = await ConsejoFinanciero.findByIdAndUser(id, userId);

    if (!consejo) {
      return res.status(404).json({ message: 'Consejo no encontrado' });
    }

    res.json(consejo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const store = async (req, res) => {
  try {
    const data = req.body;

    if (!data.user_id || !data.mensaje) {
      return res.status(400).json({
        message: 'Debes enviar user_id y mensaje para el consejo',
      });
    }

    const newConsejo = await ConsejoFinanciero.create(data);
    res.status(201).json(newConsejo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const destroy = async (req, res) => {
  try {
    const userId = req.user.id || req.user.user_id;
    const { id } = req.params;
    const deleted = await ConsejoFinanciero.deleteByUser(id, userId);

    if (!deleted) {
      return res.status(404).json({ message: 'Consejo no encontrado' });
    }

    res.json({ message: 'Consejo eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
