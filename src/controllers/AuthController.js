import supabaseService from '../services/supabaseService.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import Usuario from '../models/Usuario.js';

const { supabase } = supabaseService;

class AuthController {

  /* =========================
     LOGIN
  ========================= */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos' });
      }

      const normalizedEmail = email.toLowerCase().trim();

      console.log('🔐 Login Supabase:', normalizedEmail);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        console.error('❌ Supabase login error:', error.message);
        return res.status(401).json({ message: 'Email o contraseña incorrectos' });
      }

      const supabaseUser = data.user;
      const session = data.session;

      if (!supabaseUser || !session) {
        return res.status(500).json({ message: 'Error de sesión' });
      }

      // Buscar usuario local
      let user = await Usuario.query().findOne({ user_id: supabaseUser.id });

      // Si no existe → crear
      if (!user) {
        user = await Usuario.query().insert({
          user_id: supabaseUser.id,
          nombre: supabaseUser.user_metadata?.display_name || 'Usuario',
          email: normalizedEmail,
          moneda: 'CLP',
          activo: true,
        });
      }

      return res.status(200).json({
        message: 'Login exitoso',
        user: {
          id: user.user_id,
          nombre: user.nombre,
          email: user.email,
        },
        token: session.access_token,
      });

    } catch (err) {
      console.error('🔥 LOGIN ERROR:', err);
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
      if (!supabase) {
        return res.status(500).json({ message: 'Supabase no disponible' });
      }


      const normalizedEmail = email.toLowerCase().trim();

      console.log('📝 Registro Supabase:', normalizedEmail);

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
        console.error('❌ Supabase register error:', error.message);
        return res.status(400).json({ message: error.message });
      }

      const supabaseUser = data.user;

      if (!supabaseUser) {
        return res.status(500).json({ message: 'No se pudo crear el usuario' });
      }

      // Crear usuario local
      await Usuario.query().insert({
        user_id: supabaseUser.id,
        nombre: name,
        email: normalizedEmail,
        moneda: 'CLP',
        activo: true,
      });

      return res.status(201).json({
        message: 'Usuario registrado correctamente. Revisa tu correo si es necesario confirmar.',
      });

    } catch (err) {
      console.error('🔥 REGISTER ERROR:', err);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

export default AuthController;
