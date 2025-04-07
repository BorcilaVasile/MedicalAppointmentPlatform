module.exports = function(req, res, next) {
  // Verifică dacă utilizatorul are rol de admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
}; 