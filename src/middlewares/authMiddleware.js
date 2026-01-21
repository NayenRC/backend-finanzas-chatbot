import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // El formato esperado es "Bearer TOKEN"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido o expirado.' });
    }

    req.user = user;
    next();
  });
};
