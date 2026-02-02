import supabaseService from "../services/supabaseService.js";

const { supabase } = supabaseService;

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token requerido" });
  }

  try {
    // ✅ VALIDAR TOKEN SUPABASE
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(403).json({ message: "Token inválido" });
    }

    req.user = {
      id: data.user.id,
      email: data.user.email,
    };

    next();
  } catch (err) {
    console.error("❌ Auth middleware error:", err);
    res.status(403).json({ message: "Token inválido" });
  }
}
