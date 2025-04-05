const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');



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

router.put('/update', authMiddleware, async (req, res) => {
  const { name, email } = req.body;

  // Validare
  if (!name || !email) {
    return res.status(400).json({ message: 'Numele și email-ul sunt obligatorii.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit.' });
    }

    // Verifică dacă email-ul este deja folosit de alt utilizator
    if (email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email-ul este deja folosit.' });
      }
    }

    // Actualizează câmpurile
    user.name = name;
    user.email = email;
    await user.save();

    res.json({ name: user.name, email: user.email, role: user.role });
  } catch (err) {
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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;