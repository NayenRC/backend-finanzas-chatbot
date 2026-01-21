import Usuario from '../models/Usuario.js';

export const index = async (req, res) => {
  try {
    const users = await Usuario.all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const show = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Usuario.find(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const store = async (req, res) => {
  try {
    const data = req.body;
    const newUser = await Usuario.create(data);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedUser = await Usuario.update(id, data);

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    await Usuario.delete(id);
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ... (tus funciones index, show, store, etc. se quedan igual)

// Al final del archivo, crea el objeto y expórtalo:
const UsuarioController = {
    index,
    show,
    store,
    update,
    destroy
};

export default UsuarioController;