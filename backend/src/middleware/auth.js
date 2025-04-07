const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Load user details
    User.findById(decoded.id)
      .select('-password')
      .populate('clinic', 'name address')
      .then(user => {
        if (!user) {
          return res.status(401).json({ message: 'User not found' });
        }
        req.user = {
          ...decoded,
          details: user
        };
        next();
      })
      .catch(err => {
        console.error('Error loading user details:', err);
        res.status(500).json({ message: 'Server error' });
      });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 