const jwt = require('jsonwebtoken');

// Middleware pentru verificarea token-ului JWT
const authMiddleware = (req, res, next) => {
  // Obține token-ul din header-ul Authorization (format: "Bearer <token>")
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized access. Invalid token.' });
  }

  try {
    // Verifică token-ul folosind JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adaugă informațiile despre utilizator în cerere (req.user)
    req.user = {
      id: decoded.id,
      type: decoded.type, // "Admin", "Patient", sau "Doctor"
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized access. Invalid token' });
  }
};

// Middleware opțional pentru a restricționa accesul la anumite tipuri de utilizatori
const restrictTo = (...types) => {
  return (req, res, next) => {
    if (!types.includes(req.user.type)) {
      return res.status(403).json({ error: 'Unauthorized access . Unauthorized user' });
    }
    next();
  };
};

module.exports = { authMiddleware, restrictTo };