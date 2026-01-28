import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';
import supabaseService from '../services/supabaseService.js';

const { supabase } = supabaseService;

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y password requeridos' });
    }

    // 1️⃣ Autenticación REAL con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const supabaseUser = data.user;

    // 2️⃣ Buscar perfil en tabla usuario
    let perfil = await Usuario.query()
      .findOne({ email: supabaseUser.email });

    // (opcional) crear perfil si no existe
    if (!perfil) {
      perfil = await Usuario.query().insert({
        user_id: supabaseUser.id,
        email: supabaseUser.email,
        nombre: supabaseUser.email.split('@')[0],
        activo: true
      });
    }

    // 3️⃣ Crear JWT propio
    const token = jwt.sign(
      {
        id: perfil.user_id,
        email: perfil.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 4️⃣ Respuesta al frontend
    res.json({
      token,
      user: {
        id: perfil.user_id,
        email: perfil.email,
        nombre: perfil.nombre
      }
    });

  } catch (err) {
    console.error('🔥 Login error:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email y password requeridos'
      });
    }

    // 1️⃣ Crear usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error || !data.user) {
      return res.status(400).json({
        message: error?.message || 'Error al registrar usuario'
      });
    }

    const supabaseUser = data.user;

    // 2️⃣ Crear perfil en tabla usuario
    await Usuario.query().insert({
      user_id: supabaseUser.id,
      email: supabaseUser.email,
      nombre: name || email.split('@')[0],
      activo: true
    });

    return res.status(201).json({
      message: 'Usuario registrado correctamente'
    });

  } catch (err) {
    console.error('🔥 Register error:', err);
    return res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};
