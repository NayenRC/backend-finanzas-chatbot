import Gasto from '../models/Gasto.js';

export const index = async (req, res) => {
  try {
    // Si viene userId como parámetro, filtra por usuario
    const { userId } = req.params;

    if (userId) {
      const gastosPorUsuario = await Gasto.findByUser(userId);
      return res.json(gastosPorUsuario);
    }

    // Si no viene userId, devuelve todos los gastos
    const gastos = await Gasto.all();
    res.json(gastos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const show = async (req, res) => {
  try {
    const { id } = req.params;
    const gasto = await Gasto.find(id);

    if (!gasto) {
      return res.status(404).json({ message: 'Gasto no encontrado' });
    }

    res.json(gasto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const store = async (req, res) => {
  try {
    // 1. Obtenemos los datos del cuerpo de la petición
    const data = req.body;

    // 2. ¡MAGIA! Asignamos el ID del usuario logueado automáticamente
    // (req.user viene del token gracias a tu middleware de seguridad)
    if (req.user && req.user.id) {
        data.user_id = req.user.id;
    }

    // Validación mínima
    if (!data.user_id || !data.monto || !data.fecha) {
      return res.status(400).json({ message: 'Faltan campos obligatorios (user_id, monto o fecha)' });
    }

    const newGasto = await Gasto.create(data);
    res.status(201).json(newGasto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updatedGasto = await Gasto.update(id, data);

    if (!updatedGasto) {
      return res.status(404).json({ message: 'Gasto no encontrado' });
    }

    res.json(updatedGasto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    await Gasto.delete(id);
    res.json({ message: 'Gasto eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
