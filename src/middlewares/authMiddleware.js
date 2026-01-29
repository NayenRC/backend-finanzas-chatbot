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
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (data?.user) {
      req.user = data.user;
      return next();
    }
  } catch (err) {
    // Silenciosamente fallar y pasar al siguiente método
  }

  // 2. Intentar validar localmente (para usuarios de Telegram o tokens antiguos)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    console.log('❌ Auth Error:', err.message);
    return res.status(403).json({ message: "Token inválido o expirado" });
  }
}
