import supabase from '../services/supabaseService.js';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';
// import emailService from '../services/emailService.js'; // si lo usas


class AuthController {

  /* =========================
     LOGIN (SUPABASE AUTH)
  ========================= */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: 'Email y contraseña son requeridos',
        });
      }

      const normalizedEmail = email.toLowerCase().trim();
      console.log('🔐 Login Supabase:', normalizedEmail);

      /* =========================
         1️⃣ Login en Supabase
      ========================= */
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error || !data?.session) {
        return res.status(401).json({
          message: 'Email o contraseña incorrectos',
        });
      }

      const supabaseUser = data.user;
      const accessToken = data.session.access_token;

      /* =========================
         2️⃣ Buscar usuario en TU BD
         🔑 POR EMAIL, NO POR ID
      ========================= */
      let usuario = await Usuario.query()
        .findOne({ email: normalizedEmail });

      /* =========================
         3️⃣ Crear si no existe
      ========================= */
      if (!usuario) {
        console.log('⚠️ Usuario no existe en BD, creando...');
        usuario = await Usuario.query().insert({
          email: normalizedEmail,
          nombre: supabaseUser.user_metadata?.display_name || 'Usuario',
          moneda: 'CLP',
          activo: true,
        });
      }

      /* =========================
         4️⃣ RESPUESTA FINAL
      ========================= */
      return res.status(200).json({
        message: 'Login exitoso',
        token: accessToken, // 🔑 SOLO token Supabase
        user: {
          user_id: usuario.user_id, // 👈 TU BD
          nombre: usuario.nombre,
          email: usuario.email,
        },
      });

    } catch (error) {
      console.error('🔥 LOGIN ERROR:', error);
      return res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }


  /* =========================
     REGISTER
  ========================= */
  static async register(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          message: 'Todos los campos son requeridos',
        });
      }

      const normalizedEmail = email.toLowerCase().trim();

      /* =========================
         1️⃣ Registro en Supabase Auth
      ========================= */
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            display_name: name,
          },
        },
      });

      if (error || !data?.user) {
        console.error('❌ Supabase Register Error:', error?.message);
        return res.status(400).json({
          message: error?.message || 'Error al registrar usuario',
        });
      }

      /* =========================
         2️⃣ Crear usuario en TU BD
         🔑 SIN usar supabaseUser.id
      ========================= */
      await Usuario.query().insert({
        email: normalizedEmail,
        nombre: name,
        moneda: 'CLP',
        activo: true,
      });

      return res.status(201).json({
        message:
          'Usuario registrado exitosamente. Revisa tu correo para confirmar la cuenta.',
      });

    } catch (error) {
      console.error('🔥 REGISTER ERROR:', error);
      return res.status(500).json({
        message: 'Error interno al registrar usuario',
        error: error.message
      });
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
