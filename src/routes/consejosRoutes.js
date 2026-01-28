import { Router } from 'express';
import {
    index,
    show,
    store,
    destroy,
} from '../controllers/ConsejoFinancieroController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', index);
router.get('/:id', show);
router.post('/', store);
router.delete('/:id', destroy);
// router.get('/usuario/:userId', index); // Handled in usuariosRoutes

export default router;
