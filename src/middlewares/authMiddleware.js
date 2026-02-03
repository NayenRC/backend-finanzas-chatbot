import supabaseService from '../services/supabaseService.js';
import Usuario from '../models/Usuario.js';

const { supabase } = supabaseService;

export async function authenticateToken(req, res, next) {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  try {
    // 1️⃣ Validar token con Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(403).json({ message: 'Token inválido o expirado' });
    }

    // 2️⃣ Buscar usuario REAL en tu BD
    const usuario = await Usuario.query()
      .findOne({ email: data.user.email });

    if (!usuario) {
      return res.status(403).json({ message: 'Usuario no registrado en la base de datos' });
    }

    // 3️⃣ ESTE es el user_id correcto
    req.user = {
      id: usuario.user_id,   // ✅ TU BD
      email: usuario.email,
    };

    next();

  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(500).json({ message: 'Error autenticando token' });
  }
}

export default authenticateToken;
