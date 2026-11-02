// Vérifie le jeton JWT envoyé dans l'en-tête "Authorization: Bearer <jeton>"
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authentification requise.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ message: 'Session expirée ou invalide. Veuillez vous reconnecter.' });
  }
}

module.exports = { requireAuth };
