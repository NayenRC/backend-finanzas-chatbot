import { Router } from 'express';
import {
    index,
    show,
    store,
    update,
    destroy
} from '../controllers/CategoriaController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas las rutas de categorías requieren autenticación
router.get('/', authenticateToken, index);
router.get('/:id', authenticateToken, show);
router.post('/', authenticateToken, store);
router.put('/:id', authenticateToken, update);
router.delete('/:id', authenticateToken, destroy);

export default router;
