import Categoria from '../models/Categoria.js';

export const index = async (req, res) => {
  try {
    // Prioridad: userId por params (si lo necesitas), si no, el usuario autenticado
    const idToSearch = req.params.userId || req.user?.user_id;

    if (idToSearch) {
      const categorias = await Categoria.findByUser(idToSearch);
      return res.json(categorias);
    }

    // Si no hay usuario (caso público / admin)
    const categorias = await Categoria.all();
    res.json(categorias);
  } catch (error) {
    console.error("❌ Categorias index error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const show = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await Categoria.find(id);

    if (!categoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    res.json(categoria);
  } catch (error) {
    console.error("❌ Categorias show error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const store = async (req, res) => {
  try {
    const data = {
      ...req.body,
      user_id: req.user.user_id, // 🔑 ÚNICO ORIGEN
    };

    if (!data.nombre || !data.tipo) {
      return res.status(400).json({ message: 'Nombre y tipo son obligatorios' });
    }

    const newCategoria = await Categoria.create(data);
    res.status(201).json(newCategoria);
  } catch (error) {
    console.error("❌ Categorias store error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCategoria = await Categoria.update(id, req.body);

    if (!updatedCategoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    res.json(updatedCategoria);
  } catch (error) {
    console.error("❌ Categorias update error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    await Categoria.delete(id);
    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error("❌ Categorias destroy error:", error);
    res.status(500).json({ error: error.message });
  }
};
