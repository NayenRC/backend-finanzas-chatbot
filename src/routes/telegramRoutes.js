import { Router } from 'express';
const router = Router();

router.post('/telegram/login', (req, res) => {
  const { telegram_id, username, nombre } = req.body;

  if (!telegram_id) {
    return res.status(400).json({ error: 'telegram_id requerido' });
  }

  // 🔑 Simulación de login
  return res.json({
    token: 'telegram-token-demo',
    user: {
      telegram_id,
      username,
      nombre,
    },
  });
});

export default router;
