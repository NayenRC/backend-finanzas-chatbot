/**
 * Controlador de Artículos
 *
 * Maneja la lógica de negocio para las rutas relacionadas con artículos.
 * Cada método corresponde a una operación CRUD típica.
 */

import Article from '../models/Article.js';

class ArticleController {
  /**
   * GET /articles
   * Obtiene todos los artículos.
   */
  static async index(req, res) {
    try {
      const articles = await Article.all();
      res.json(articles);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  /**
   * GET /articles/:id
   * Obtiene un artículo por su ID.
   */
  static async show(req, res) {
    try {
      const { id } = req.params;
      const article = await Article.find(id);

      if (!article) {
        return res.status(404).json({ error: 'Artículo no encontrado' });
      }

      res.json(article);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener el artículo' });
    }
  }

  /**
   * POST /articles
   * Crea un nuevo artículo.
   */
  static async store(req, res) {
    try {
      const { title, content, author } = req.body;

      // Validación simple
      if (!title) {
        return res.status(400).json({ error: 'El título es obligatorio' });
      }

      const newArticle = await Article.create({ title, content, author });
      res.status(201).json(newArticle);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear el artículo' });
    }
  }

  /**
   * PUT /articles/:id
   * Actualiza un artículo existente.
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const updatedArticle = await Article.update(id, data);

      if (!updatedArticle) {
        return res
          .status(404)
          .json({ error: 'Artículo no encontrado para actualizar' });
      }

      res.json(updatedArticle);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar el artículo' });
    }
  }

  /**
   * DELETE /articles/:id
   * Elimina un artículo.
   */
  static async destroy(req, res) {
    try {
      const { id } = req.params;
      const deletedCount = await Article.delete(id);

      if (deletedCount === 0) {
        return res
          .status(404)
          .json({ error: 'Artículo no encontrado para eliminar' });
      }

      res.json({ message: 'Artículo eliminado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar el artículo' });
    }
  }
}

export default ArticleController;
