import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';
import supabaseService from '../services/supabaseService.js';
const { supabase } = supabaseService;
class AuthController {
  // ... (previous methods)

  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email es requerido' });
      }

      // 1. Buscar usuario
      const user = await Usuario.query().findOne({ email });

      // Por seguridad, no revelamos si el email existe
      if (!user) {
        return res.status(200).json({
          message: 'Si el email está registrado, recibirás un correo con instrucciones.'
        });
      }

      // 2. Generar token único
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora

      // 3. Guardar en DB
      await Usuario.query()
        .patch({
          reset_password_token: resetToken,
          reset_password_expires: resetPasswordExpires
        })
        .where('user_id', user.user_id);

      // 4. Enviar email
      await emailService.sendPasswordResetEmail(email, resetToken);

      res.status(200).json({
        message: 'Si el email está registrado, recibirás un correo con instrucciones.'
      });

    } catch (error) {
      console.error('❌ FORGOT PASSWORD ERROR:', error);
      res.status(500).json({ message: 'Error al procesar solicitud de recuperación' });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token y nueva contraseña son requeridos' });
      }

      // 1. Buscar usuario por token y que no esté expirado
      const user = await Usuario.query()
        .findOne({ reset_password_token: token })
        .where('reset_password_expires', '>', new Date());

      if (!user) {
        return res.status(400).json({ message: 'Token inválido o expirado' });
      }

      // 2. Hash nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 3. Actualizar contraseña y limpiar campos de reset
      await Usuario.query()
        .patch({
          password: hashedPassword,
          reset_password_token: null,
          reset_password_expires: null
        })
        .where('user_id', user.user_id);

      res.status(200).json({ message: 'Contraseña actualizada exitosamente' });

    } catch (error) {
      console.error('❌ RESET PASSWORD ERROR:', error);
      res.status(500).json({ message: 'Error al restablecer contraseña' });
    }
  }

  static async verifyResetToken(req, res) {
    try {
      const { token } = req.params;

      const user = await Usuario.query()
        .findOne({ reset_password_token: token })
        .where('reset_password_expires', '>', new Date());

      if (!user) {
        return res.status(400).json({ valid: false, message: 'Token inválido o expirado' });
      }

      res.status(200).json({ valid: true, message: 'Token válido' });

    } catch (error) {
      console.error('❌ VERIFY TOKEN ERROR:', error);
      res.status(500).json({ message: 'Error al verificar token' });
    }
  }

  static async register(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // 1. Registrar en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: password,
        options: {
          data: {
            display_name: name,
          },
        },
      });

      if (authError) {
        console.error('❌ Supabase Auth Register Error:', authError.message);
        return res.status(400).json({ message: authError.message });
      }

      const supabaseUser = authData.user;
      if (!supabaseUser) {
        return res.status(500).json({ message: 'Error al registrar usuario en Auth' });
      }

      // 2. Sincronizar con tabla local 'usuario'
      try {
        const newUser = await Usuario.query().insert({
          user_id: supabaseUser.id,
          nombre: name,
          email: normalizedEmail,
          moneda: 'CLP',
          activo: true
        });

        res.status(201).json({
          message: 'Usuario registrado exitosamente',
          user: {
            id: newUser.user_id,
            nombre: newUser.nombre,
            email: newUser.email
          }
        });
      } catch (dbError) {
        console.error('⚠️ Error al guardar en tabla usuario:', dbError.message);
        res.status(201).json({
          message: 'Usuario registrado en Auth (error sync db local)',
          user: { id: supabaseUser.id, email: normalizedEmail }
        });
      }

    } catch (error) {
      console.error('❌ REGISTER ERROR:', error);
      res.status(500).json({ message: 'Error interno al registrar usuario' });
    }
  }

  static async getProfile(req, res) {
    res.json({ message: 'Perfil de usuario protegido', user: req.user });
  }

  static async telegramLogin(req, res) {
    try {
      const { telegram_id, username, nombre } = req.body;

      if (!telegram_id) {
        return res.status(400).json({ message: 'telegram_id requerido' });
      }

      let user = await Usuario.query().findOne({ telegram_id });

      // Si no existe, lo creamos
      if (!user) {
        user = await Usuario.query().insert({
          user_id: uuidv4(),
          telegram_id,
          nombre: nombre || 'Usuario Telegram',
          username: username || null,
          activo: true,
          moneda: 'CLP',
        });
      }

      const token = jwt.sign(
        { id: user.user_id },
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '1h' }
      );

      res.json({ token });
    } catch (error) {
      console.error('❌ TELEGRAM LOGIN ERROR:', error.message);
      res.status(500).json({ message: 'Error login Telegram' });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const normalizedEmail = email ? email.toLowerCase().trim() : '';

      console.log('🔐 Intentando login con Supabase Auth:', normalizedEmail);

      // 1. Autenticar con Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password,
      });

      if (error) {
        console.log('❌ Supabase Auth Error:', error.message);
        let message = 'Credenciales inválidas';

        if (error.message.includes('Email not confirmed')) {
          message = 'Debes confirmar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.';
        } else if (error.message.includes('Invalid login credentials')) {
          message = 'Email o contraseña incorrectos.';
        } else {
          message = error.message;
        }

        return res.status(401).json({ message });
      }

      const supabaseUser = data.user;

      // 2. Buscar/Verificar en tabla local para obtener datos adicionales
      let user = await Usuario.query().findOne({ user_id: supabaseUser.id });

      // Si por alguna razón no está en la tabla local pero sí en Auth, lo creamos
      if (!user) {
        console.log('⚠️ Usuario en Auth pero no en DB local. Sincronizando...');
        user = await Usuario.query().insert({
          user_id: supabaseUser.id,
          nombre: supabaseUser.user_metadata?.display_name || 'Usuario',
          email: normalizedEmail,
          moneda: 'CLP',
          activo: true
        });
      }

      // 3. Devolvemos el token de Supabase (o generamos nuestro propio JWT si prefieres)
      // Usualmente usamos el de Supabase (data.session.access_token)
      res.status(200).json({
        message: 'Login exitoso',
        user: {
          id: user.user_id,
          nombre: user.nombre,
          email: user.email
        },
        token: data.session.access_token,
      });

    } catch (err) {
      console.error('🔥 Login error:', err);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

}

export default AuthController;