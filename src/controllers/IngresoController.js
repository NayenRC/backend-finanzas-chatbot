import Ingreso from '../models/Ingreso.js';

export const index = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId) {
      // Filtrar ingresos por usuario
      const ingresosPorUsuario = await Ingreso.findByUser(userId);
      return res.json(ingresosPorUsuario);
    }

    // Si no hay userId, lista todos
    const ingresos = await Ingreso.all();
    res.json(ingresos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const show = async (req, res) => {
  try {
    const { id } = req.params;
    const ingreso = await Ingreso.find(id);

    if (!ingreso) {
      return res.status(404).json({ message: 'Ingreso no encontrado' });
    }
    res.json(ingreso);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const store = async (req, res) => {
  try {
    const data = req.body;

    if (!data.user_id || !data.monto || !data.fecha) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const newIngreso = await Ingreso.create(data);
    res.status(201).json(newIngreso);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updatedIngreso = await Ingreso.update(id, data);

    if (!updatedIngreso) {
      return res.status(404).json({ message: 'Ingreso no encontrado' });
    }

    res.json(updatedIngreso);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    await Ingreso.delete(id);
    res.json({ message: 'Ingreso eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

