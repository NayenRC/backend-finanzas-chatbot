import jwt from "jsonwebtoken";
import supabaseService from "../services/supabaseService.js";
const { supabase } = supabaseService;

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token requerido" });
  }

  // 1. Intentar validar con Supabase (para usuarios web)
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (data?.user) {
        req.user = data.user;
        return next();
      }
      if (error) {
        console.log('⚠️ Supabase Auth Validation Info:', error.message);
        // No retornamos aquí para permitir que Telegram intente validar su propio JWT
      }
    } catch (err) {
      console.error('🔥 Supabase validation exception:', err.message);
    }
  } else {
    console.warn('⚠️ Supabase client not initialized. Skipping Supabase auth.');
  }

  // 2. Intentar validar localmente (para usuarios de Telegram o tokens antiguos)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    // Si falló el algoritmo, es probable que fuera un token de Supabase RS256
    // intentando ser validado como HS256 local.
    const isInvalidAlgorithm = err.message.includes('invalid algorithm');

    if (isInvalidAlgorithm) {
      console.log('❌ Auth Error (RS256/Supabase Fallthrough):', err.message);
      return res.status(401).json({
        message: "Sesión de Supabase inválida o expirada",
        details: "El token no pudo ser validado por Supabase y no es un token local válido."
      });
    }

    console.log('❌ Auth Error (Local):', err.message);
    return res.status(403).json({ message: "Token inválido o expirado" });
  }
}
