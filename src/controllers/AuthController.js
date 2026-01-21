import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

class AuthController {
  static async register(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
      }

      // Verificar si el usuario ya existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'El usuario ya existe' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear usuario
      const [newUser] = await User.query()
        .insert({
          name,
          email,
          password: hashedPassword,
        })
        .returning('*');

      // Generar token
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email },
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '1h' },
      );

      // No devolver el password
      delete newUser.password;

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: newUser,
        token,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Error al registrar usuario', error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: 'Email y password son requeridos' });
      }

      // Buscar usuario
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      // Verificar password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      // Generar token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '1h' },
      );

      res.status(200).json({
        message: 'Login exitoso',
        user: { id: user.id, name: user.name, email: user.email },
        token,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Error al iniciar sesión', error: error.message });
    }
  }

  static async getProfile(req, res) {
    // El usuario ya viene en req.user gracias al middleware
    // Podemos buscar datos frescos en la DB si es necesario, o retornar lo del token
    res.json({ message: 'Perfil de usuario protegido', user: req.user });
  }
}

export default AuthController;
