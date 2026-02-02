import supabaseService from '../services/supabaseService.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import Usuario from '../models/Usuario.js';
// import emailService from '../services/emailService.js'; // si lo usas

const { supabase } = supabaseService;

class AuthController {

  /* =========================
     LOGIN (SUPABASE AUTH)
  ========================= */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos' });
      }

      const normalizedEmail = email.toLowerCase().trim();
      console.log('🔐 Intentando login con Supabase Auth:', normalizedEmail);

      // 1. Login en Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        console.log('❌ Supabase Auth Error:', error.message);

        let message = 'Credenciales inválidas';

        if (error.message?.includes('Email not confirmed')) {
          message = 'Debes confirmar tu correo antes de iniciar sesión.';
        } else if (error.message?.includes('Invalid login credentials')) {
          message = 'Email o contraseña incorrectos.';
        }

        return res.status(401).json({ message });
      }

      const supabaseUser = data.user;

      // 2. Buscar usuario en DB local
      let user = await Usuario.query().findOne({ user_id: supabaseUser.id });

      // 3. Si no existe en DB local, lo sincronizamos
      if (!user) {
        console.log('⚠️ Usuario no existe en DB local. Creando...');
        user = await Usuario.query().insert({
          user_id: supabaseUser.id,
          nombre: supabaseUser.user_metadata?.display_name || 'Usuario',
          email: normalizedEmail,
          moneda: 'CLP',
          activo: true,
        });
      }

      // 4. Respuesta consistente
      return res.status(200).json({
        message: 'Login exitoso',
        token: data.session.access_token, // token Supabase
        user: {
          id: user.user_id,
          nombre: user.nombre,
          email: user.email,
        },
      });

    } catch (error) {
      console.error('🔥 LOGIN ERROR:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /* =========================
     REGISTER
  ========================= */
  static async register(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // 1. Registro en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            display_name: name,
          },
        },
      });

      if (error) {
        console.error('❌ Supabase Register Error:', error.message);
        return res.status(400).json({ message: error.message });
      }

      const supabaseUser = data.user;
      if (!supabaseUser) {
        return res.status(500).json({ message: 'Error al crear usuario en Auth' });
      }

      // 2. Guardar en DB local
      try {
        await Usuario.query().insert({
          user_id: supabaseUser.id,
          nombre: name,
          email: normalizedEmail,
          moneda: 'CLP',
          activo: true,
        });
      } catch (dbError) {
        console.warn('⚠️ Usuario creado en Auth pero no en DB local:', dbError.message);
      }

      return res.status(201).json({
        message: 'Usuario registrado exitosamente. Revisa tu correo para confirmar la cuenta.',
      });

    } catch (error) {
      console.error('🔥 REGISTER ERROR:', error);
      return res.status(500).json({ message: 'Error interno al registrar usuario' });
    }
  }

  /* =========================
     PROFILE (PROTEGIDO)
  ========================= */
  static async getProfile(req, res) {
    return res.json({
      message: 'Perfil protegido',
      user: req.user,
    });
  }

  /* =========================
     TELEGRAM LOGIN
  ========================= */
  static async telegramLogin(req, res) {
    try {
      const { telegram_id, username, nombre } = req.body;

      if (!telegram_id) {
        return res.status(400).json({ message: 'telegram_id requerido' });
      }

      let user = await Usuario.query().findOne({ telegram_id });

      if (!user) {
        user = await Usuario.query().insert({
          user_id: uuidv4(),
          telegram_id,
          nombre: nombre || 'Usuario Telegram',
          username: username || null,
          moneda: 'CLP',
          activo: true,
        });
      }

      const token = jwt.sign(
        { id: user.user_id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return res.json({ token });

    } catch (error) {
      console.error('❌ TELEGRAM LOGIN ERROR:', error);
      return res.status(500).json({ message: 'Error login Telegram' });
    }
  }

}

export default AuthController;
