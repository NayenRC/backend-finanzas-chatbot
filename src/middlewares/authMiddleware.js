import supabaseService from '../services/supabaseService.js';

const { supabase } = supabaseService;

export async function authenticateToken(req, res, next) {
  // ✅ Permitir preflight CORS
  if (req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(403).json({ message: 'Token inválido o expirado' });
    }

    req.user = {
      id: data.user.id,
      email: data.user.email,
    };

    return next();

  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(500).json({ message: 'Error autenticando token' });
  }
}

export default authenticateToken;

