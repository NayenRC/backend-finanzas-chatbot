import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';
import { v4 as uuidv4 } from 'uuid';

class TelegramAuthController {
  static async login(req, res) {
    try {
      const { telegram_id, username, nombre } = req.body;

      if (!telegram_id) {
        return res.status(400).json({ error: 'telegram_id requerido' });
      }

      // 🔍 Buscar usuario por telegram_id
      let user = await Usuario.query().findOne({ telegram_id });

      // 👤 Si no existe → crear
      if (!user) {
        user = await Usuario.query()
          .insert({
            user_id: uuidv4(),
            telegram_id,
            nombre: nombre || username || 'Usuario Telegram',
            email: `${telegram_id}@telegram.smartfin`,
            password: 'telegram',
            moneda: 'CLP',
            activo: true,
          })
          .returning('*');
      }

      // 🔐 Crear token
      const token = jwt.sign(
        { id: user.user_id },
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login Telegram OK',
        token,
        user: {
          id: user.user_id,
          nombre: user.nombre,
          telegram_id: user.telegram_id,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error login telegram' });
    }
  }
}

export default TelegramAuthController;
