import jwt from "jsonwebtoken";
import supabaseService from "../services/supabaseService.js";

const { supabase } = supabaseService;

export async function authenticateToken(req, res, next) {
  // ✅ Permitir preflight SIN autenticación
  if (req.method === "OPTIONS") {
    return next();
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token requerido" });
  }

  /* =========================
     1️⃣ Intentar Supabase
  ========================== */
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.getUser(token);

      if (data?.user) {
        req.user = {
          id: data.user.id,
          email: data.user.email,
        };
        return next();
      }
    } catch (err) {
      console.warn("⚠️ Supabase auth falló, usando JWT local");
    }
  } else {
    console.warn("⚠️ Supabase no inicializado, usando JWT local");
  }

  /* =========================
     2️⃣ Fallback JWT local
  ========================== */
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(403).json({ message: "Token inválido" });
  }
}

export default authenticateToken;
