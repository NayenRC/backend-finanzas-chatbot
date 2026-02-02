import jwt from "jsonwebtoken";
import supabaseService from "../services/supabaseService.js";
import Usuario from "../models/Usuario.js";

const { supabase } = supabaseService;

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token requerido" });
  }

  /* =========================
     1️⃣ SUPABASE (WEB)
  ========================= */
  if (supabase) {
    try {
      const { data } = await supabase.auth.getUser(token);

      if (data?.user) {
        const usuarioLocal = await Usuario.findByEmail(data.user.email);

        if (!usuarioLocal) {
          return res.status(403).json({
            message: "Usuario no existe en BD local",
          });
        }

        req.user = {
          id: usuarioLocal.id || usuarioLocal.user_id,
          email: usuarioLocal.email,
          source: "supabase",
        };

        return next();
      }
    } catch (err) {
      console.warn("⚠️ Supabase auth falló:", err.message);
    }
  }

  /* =========================
     2️⃣ JWT LOCAL (Telegram)
  ========================= */
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret_key"
    );

    req.user = {
      id: decoded.id || decoded.user_id,
      email: decoded.email,
      source: "jwt",
    };

    return next();
  } catch (err) {
    return res.status(403).json({ message: "Token inválido o expirado" });
  }
}
export default authenticateToken;