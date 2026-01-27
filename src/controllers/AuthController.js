import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Usuario from '../models/Usuario.js';
import { v4 as uuidv4 } from 'uuid'; // Necesitarás esto si tu DB no genera UUIDs automáticamente

class AuthController {
  static async register(req, res) {
    try {
      // 1. Recibir datos (usamos 'nombre' para coincidir con tu DB, o lo mapeamos abajo)
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Faltan campos requeridos: name, email, password' });
      }

      // 2. Verificar si el usuario ya existe
      // Nota: Objection usa .query().findOne()
      const existingUser = await Usuario.query().findOne({ email }); 
      
      if (existingUser) {
        return res.status(400).json({ message: 'El usuario ya existe' });
      }

      // 3. Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 4. Crear usuario
      // IMPORTANTE: Mapeamos 'name' a 'nombre' que es como se llama tu columna en Supabase
      const newUser = await Usuario.query()
        .insert({
          user_id: uuidv4(), // Generamos ID manualmente si la DB no tiene "default gen_random_uuid()"
          nombre: name,
          email: email,      // Tu tabla necesita esta columna
          password: hashedPassword, // Tu tabla necesita esta columna
          moneda: 'CLP',     // Valor por defecto
          activo: true
        })
        .returning('*'); // Para Postgres devuelve el objeto creado

      // 5. Generar token
      const token = jwt.sign(
        { id: newUser.user_id, email: newUser.email }, // Usamos user_id
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '1h' },
      );

      // No devolver el password en la respuesta
      const usuarioResponse = { ...newUser };
      delete usuarioResponse.password;

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: usuarioResponse,
        token,
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email y password son requeridos' });
      }

      // 1. Buscar usuario por email
      const user = await Usuario.query().findOne({ email });
      
      if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      // 2. Verificar password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      // 3. Generar token
      const token = jwt.sign(
        { id: user.user_id, email: user.email }, // Usamos user_id
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '1h' },
      );

      res.status(200).json({
        message: 'Login exitoso',
        user: { 
            id: user.user_id, 
            nombre: user.nombre, 
            email: user.email 
        },
        token,
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
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

}

export default AuthController;