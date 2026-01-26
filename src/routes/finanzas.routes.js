import { Router } from 'express';
const router = Router();

// Registrar gasto
router.post('/gastos', (req, res) => {
  const { monto, descripcion, fecha } = req.body;

  if (!monto || !descripcion) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  return res.json({
    ok: true,
    tipo: 'gasto',
    monto,
    descripcion,
    fecha,
  });
});

// Registrar ingreso
router.post('/ingresos', (req, res) => {
  const { monto, descripcion, fecha } = req.body;

  if (!monto || !descripcion) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  return res.json({
    ok: true,
    tipo: 'ingreso',
    monto,
    descripcion,
    fecha,
  });
});

export default router;
