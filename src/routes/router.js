/**
 * Definición de Rutas
 *
 * Aquí centralizamos todas las rutas de la API.
 */

import { Router } from 'express';
import ArticleController from '../controllers/ArticleController.js';
import AuthController from '../controllers/AuthController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import OpenRouterService from '../services/OpenRouter.js';
import Article from '../models/Article.js';

// Importa tus controladores
import UsuarioController from '../controllers/UsuarioController.js';
/*import GastoController from '../controllers/GastoController.js';
import IngresoController from '../controllers/IngresoController.js';
import MetaAhorroController from '../controllers/MetaAhorroController.js';
*/
import {
  index as usuarioIndex,
  show as usuarioShow,
  store as usuarioStore,
  update as usuarioUpdate,
  destroy as usuarioDestroy,
} from '../controllers/UsuarioController.js';

const router = Router();

// ------------------
// RUTAS DE AUTENTICACIÓN
// ------------------
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.get('/profile', authenticateToken, AuthController.getProfile);

// ------------------
// RUTAS DE ARTÍCULOS (CRUD)
// ------------------
router.get('/articles', ArticleController.index);
router.get('/articles/:id', ArticleController.show);
router.post('/articles', ArticleController.store);
router.put('/articles/:id', ArticleController.update);
router.delete('/articles/:id', ArticleController.destroy);

// Ruta especial de IA
router.post('/articles/:id/summarize', async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.find(id);

    if (!article) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }

    if (!article.content) {
      return res
        .status(400)
        .json({ error: 'El artículo no tiene contenido para resumir' });
    }

    const summary = await OpenRouterService.generateSummary(article.content);

    res.json({
      original_id: article.id,
      summary: summary,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generando el resumen' });
  }
});

// ------------------
// RUTAS DE TU PROYECTO FINANCIERO
// ------------------

// Usuarios
// RUTAS DE USUARIOS
router.get('/usuarios', usuarioIndex);
router.get('/usuarios/:id', usuarioShow);
router.post('/usuarios', usuarioStore);
router.put('/usuarios/:id', usuarioUpdate);
router.delete('/usuarios/:id', usuarioDestroy);

/*
// Gastos
router.get('/usuarios/:userId/gastos', GastoController.index);
router.post('/usuarios/:userId/gastos', GastoController.store);
router.get('/gastos/:id', GastoController.show);
router.put('/gastos/:id', GastoController.update);
router.delete('/gastos/:id', GastoController.destroy);

// Ingresos
router.get('/usuarios/:userId/ingresos', IngresoController.index);
router.post('/usuarios/:userId/ingresos', IngresoController.store);
router.get('/ingresos/:id', IngresoController.show);
router.put('/ingresos/:id', IngresoController.update);
router.delete('/ingresos/:id', IngresoController.destroy);

// Metas de Ahorro
router.get('/usuarios/:userId/metas', MetaAhorroController.index);
router.post('/usuarios/:userId/metas', MetaAhorroController.store);
router.get('/metas/:id', MetaAhorroController.show);
router.put('/metas/:id', MetaAhorroController.update);
router.delete('/metas/:id', MetaAhorroController.destroy);

// ------------------
// RUTA BASE DE PRUEBA
// ------------------
router.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API Educativa con Node 24' });
});*/

export default router;
