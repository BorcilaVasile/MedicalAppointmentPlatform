const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const Doctor = require('../models/Doctor');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image file.'), false);
    }
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Excludem parola din răspuns
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit.' });
    }
    res.json(user); // Returnăm datele utilizatorului (inclusiv name, email, role)
  } catch (err) {
    res.status(500).json({ message: 'Eroare server.' });
  }
});

router.put('/update', authMiddleware, upload.single('profilePicture'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit.' });
    }

    // Update basic fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) {
      // Check if email is already used by another user
      if (req.body.email !== user.email) {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
          return res.status(400).json({ message: 'Email-ul este deja folosit.' });
        }
        user.email = req.body.email;
      }
    }
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.address) user.address = req.body.address;

    // Handle profile picture if uploaded
    if (req.file) {
      user.profilePicture = `/uploads/${req.file.filename}`;
    }

    await user.save();

    // Return updated user data without password
    const updatedUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      profilePicture: user.profilePicture,
      role: user.role,
      registrationDate: user.createdAt
    };

    res.json(updatedUser);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Eroare server.' });
  }
});

// PUT /api/auth/change-password - Schimbă parola utilizatorului
router.put('/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Validare
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Parola curentă și parola nouă sunt obligatorii.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Parola nouă trebuie să aibă cel puțin 6 caractere.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit.' });
    }

    // Verifică parola curentă folosind metoda matchPassword
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Parola curentă este incorectă.' });
    }

    // Actualizează parola (va fi hash-uită automat de middleware-ul pre('save'))
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Parola a fost schimbată cu succes.' });
  } catch (err) {
    res.status(500).json({ message: 'Eroare server.' });
  }
});


// Ruta de login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Caută utilizatorul după email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: 'Email sau parolă invalidă' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email sau parolă invalidă' });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Eroare server' });
  }
});

module.exports = router;