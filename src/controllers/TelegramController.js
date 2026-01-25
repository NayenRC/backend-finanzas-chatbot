/**
 * Telegram Controller
 * 
 * Controlador para manejar la lógica de negocio de las rutas de Telegram.
 */

import TelegramBot from 'node-telegram-bot-api';
import Usuario from '../models/Usuario.js';
import jwt from 'jsonwebtoken';
import aiChatCommand from '../commands/aiChatCommand.js';

// SECRET para JWT (debería ir en .env)
const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro';

/**
 * Login / Registro desde Telegram
 * 
 * Recibe: telegram_id, personal_info
 * Retorna: Token JWT, user data
 */
const login = async (req, res) => {
  try {
    const { telegram_id, username, nombre } = req.body;

    if (!telegram_id) {
      return res.status(400).json({ error: 'telegram_id requerido' });
    }

    // 1. Buscar si el usuario ya existe por telegram_id
    let usuario = await Usuario.query().findOne({ telegram_id });

    // 2. Si no existe, crearlo
    if (!usuario) {
      console.log('✨ Creando nuevo usuario desde Telegram:', telegram_id);

      // Intentamos generar un email dummy si no hay info, o dejarlo null si tu schema lo permite
      // En tu schema email es UNIQUE, asi que mejor usaremos null si es permitido o un fake único

      usuario = await Usuario.query().insert({
        telegram_user_id: telegram_id, // Asegúrate de que tu modelo use snake_case o camelCase según la DB
        nombre: nombre || username || 'Usuario Telegram',
        activo: true
      });
    }

    // 3. Generar Token JWT
    const token = jwt.sign(
      {
        user_id: usuario.user_id,
        telegram_id: usuario.telegram_user_id
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      message: 'Login exitoso',
      token,
      user: usuario
    });

  } catch (error) {
    console.error('❌ Error en Telegram Login:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Handle AI Chat
 * 
 * Recibe: mensaje
 * Retorna: respuesta IA
 */
const chat = async (req, res) => {
  try {
    // El usuario viene del middleware de auth (req.user)
    const { user_id } = req.user;
    const { mensaje } = req.body;

    if (!mensaje) {
      return res.status(400).json({ error: 'Mensaje requerido' });
    }

    // Procesar mensaje con AI Command
    const result = await aiChatCommand.processMessage(user_id, mensaje);

    return res.json(result);

  } catch (error) {
    console.error('❌ Error en AI Chat:', error);
    return res.status(500).json({ error: 'Error procesando mensaje' });
  }
};

export default {
  login,
  chat
};
