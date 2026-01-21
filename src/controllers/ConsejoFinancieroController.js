import ConsejoFinanciero from '../models/ConsejoFinanciero.js';

export const index = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId) {
      const consejosUsuario = await ConsejoFinanciero.findByUser(userId);
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
    const { id } = req.params;
    const consejo = await ConsejoFinanciero.find(id);

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
    const { id } = req.params;
    await ConsejoFinanciero.delete(id);
    res.json({ message: 'Consejo eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
