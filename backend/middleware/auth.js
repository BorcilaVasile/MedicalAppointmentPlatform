const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Adaugă informațiile decodificate în req.user
    req.user = decoded;

    // Încarcă detaliile utilizatorului
    const user = await User.findById(decoded.id)
      .select('-password')
      .populate('clinic', 'name address');
      
    if (!user) {
      throw new Error('User not found');
    }

    req.user.details = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;