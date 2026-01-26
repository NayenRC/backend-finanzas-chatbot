import ChatMensaje from '../models/ChatMensaje.js';

export const index = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId) {
      const mensajesUsuario = await ChatMensaje.findByUser(userId);
      return res.json(mensajesUsuario);
    }

    const mensajes = await ChatMensaje.all();
    res.json(mensajes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const show = async (req, res) => {
  try {
    const { id } = req.params;
    const mensaje = await ChatMensaje.find(id);

    if (!mensaje) {
      return res.status(404).json({ message: 'Mensaje no encontrado' });
    }

    res.json(mensaje);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const store = async (req, res) => {
  try {
    const data = req.body;

    // 1. Asignar ID desde el token (si existe)
    if (req.user && req.user.id) {
        data.user_id = req.user.id;
    }

    // 2. Definir que NO es un mensaje del bot (es del usuario)
    data.es_bot = false; 

    // Validación
    if (!data.user_id || !data.mensaje) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const newMensaje = await ChatMensaje.create(data);
    res.status(201).json(newMensaje);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    await ChatMensaje.delete(id);
    res.json({ message: 'Mensaje eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
