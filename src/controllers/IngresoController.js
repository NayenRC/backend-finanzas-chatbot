import Ingreso from '../models/Ingreso.js';

/**
 * Listar ingresos del usuario autenticado
 */
export const index = async (req, res) => {
  try {
    const userId = req.user.id || req.user.user_id;

    const ingresos = await Ingreso.findByUser(userId);
    res.json(ingresos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Mostrar un ingreso específico del usuario
 */
export const show = async (req, res) => {
  try {
    const userId = req.user.id || req.user.user_id;
    const { id } = req.params;

    const ingreso = await Ingreso.findByIdAndUser(id, userId);

    if (!ingreso) {
      return res.status(404).json({ message: 'Ingreso no encontrado' });
    }

    res.json(ingreso);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Crear ingreso (userId automático)
 */
export const store = async (req, res) => {
  try {
    const userId = req.user.id || req.user.user_id;
    const { monto, descripcion, fecha } = req.body;

    if (!monto || !fecha) {
      return res.status(400).json({
        message: 'Monto y fecha son obligatorios'
      });
    }

    const newIngreso = await Ingreso.create({
      user_id: userId,
      monto,
      descripcion,
      fecha
    });

    res.status(201).json(newIngreso);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Actualizar ingreso del usuario
 */
export const update = async (req, res) => {
  try {
    const userId = req.user.id || req.user.user_id;
    const { id } = req.params;
    const data = req.body;

    const updatedIngreso = await Ingreso.updateByUser(id, userId, data);

    if (!updatedIngreso) {
      return res.status(404).json({ message: 'Ingreso no encontrado' });
    }

    res.json(updatedIngreso);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Eliminar ingreso del usuario
 */
export const destroy = async (req, res) => {
  try {
    const userId = req.user.id || req.user.user_id;
    const { id } = req.params;

    const deleted = await Ingreso.deleteByUser(id, userId);

    if (!deleted) {
      return res.status(404).json({ message: 'Ingreso no encontrado' });
    }

    res.json({ message: 'Ingreso eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
