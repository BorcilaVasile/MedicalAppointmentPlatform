const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // Log the entire Authorization header
    console.log('Authorization header:', req.header('Authorization'));

    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    try {
      console.log('Attempting to verify token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verified successfully:', decoded);
      
      // Add decoded information to req.user
      req.user = decoded;

      // Load user details
      console.log('Loading user details for ID:', decoded.id);
      const user = await User.findById(decoded.id)
        .select('-password')
        .populate('clinic', 'name address');
        
      if (!user) {
        console.log('User not found in database:', decoded.id);
        return res.status(401).json({ message: 'User not found' });
      }

      console.log('User found:', user.name);
      req.user.details = user;
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = authMiddleware;