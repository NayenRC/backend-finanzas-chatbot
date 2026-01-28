import Categoria from '../models/Categoria.js';

export const index = async (req, res) => {
    try {
        // Si viene userId param o tenemos el usuario en req.user
        const userIdFromParams = req.params.userId;
        const idToSearch = userIdFromParams || (req.user ? (req.user.id || req.user.user_id) : null);

        if (idToSearch) {
            const categorias = await Categoria.findByUser(idToSearch);
            return res.json(categorias);
        }

        // Si no, devolvemos todas (tal vez solo admin debería poder hacer esto, pero por ahora todas)
        const categorias = await Categoria.all();
        res.json(categorias);
    } catch (error) {
        console.error(error);
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

        if (!data.nombre || !data.tipo) {
            return res.status(400).json({ message: 'Nombre y tipo son obligatorios' });
        }

        const newCategoria = await Categoria.create(data);
        res.status(201).json(newCategoria);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const updatedCategoria = await Categoria.update(id, data);

        if (!updatedCategoria) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        res.json(updatedCategoria);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        await Categoria.delete(id);
        res.json({ message: 'Categoría eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
