import { Router } from 'express';
import {
  index,
  show,
  store,
  update,
  destroy,
} from '../controllers/GastoController.js';

const router = Router();

// authenticateToken ya se aplica en routes/index.js
router.get('/', index);
router.get('/:id', show);
router.post('/', store);
router.put('/:id', update);
router.delete('/:id', destroy);
// router.get('/usuario/:userId', index); // Ya se maneja en usuariosRoutes o index con filtro

export default router;
