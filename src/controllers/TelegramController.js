import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';
import { v4 as uuidv4 } from 'uuid';

export const telegramLogin = async (req, res) => {
  try {
    const { telegram_id, username, nombre } = req.body;

    if (!telegram_id) {
      return res.status(400).json({ message: 'telegram_id requerido' });
    }

    // 1️⃣ Buscar usuario por telegram_id
    let user = await Usuario.query().findOne({ telegram_id });

    // 2️⃣ Si no existe, crear usuario
    if (!user) {
      console.log('👤 Usuario no existe, creando...');

      user = await Usuario.query()
        .insert({
          user_id: uuidv4(),
          nombre: nombre || username || 'Telegram User',
          email: `${telegram_id}@telegram.bot`,
          telegram_id,
          moneda: 'CLP',
          activo: true,
        })
        .returning('*');
    }

    // 3️⃣ Generar token
    const token = jwt.sign(
      { id: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login Telegram OK',
      token,
      user: {
        id: user.user_id,
        nombre: user.nombre,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error login Telegram' });
  }
};
