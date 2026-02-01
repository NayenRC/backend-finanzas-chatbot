import MetaAhorroService from '../services/metaAhorroService.js';

export const store = async (req, res) => {
  try {
    const userId = req.user.id || req.user.user_id;
    const { meta_id, monto, fecha } = req.body;

    const result = await MetaAhorroService.agregarMovimiento(
      meta_id,
      userId,
      monto,
      fecha
    );

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
