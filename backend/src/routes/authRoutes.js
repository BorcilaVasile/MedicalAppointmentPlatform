const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// Ruta pentru autentificare
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('Received login request:', { email, password });

  if (!email || !password) {
    console.log('Email or password not provided');
    return res.status(400).json({ error: 'Email and password are required. ' });
  }

  console.log('Email and password provided:', { email, password });
  try {
    let user, userType;

    // Caută utilizatorul în colecția Admin
    user = await Admin.findOne({ email });
    if (user) {
      userType = 'Admin';
      console.log('User found in Admin collection:', user);
    }

    // Dacă nu e Admin, caută în colecția Patient
    if (!user) {
      user = await Patient.findOne({ email });
      if (user) {
        userType = 'Patient';
        console.log('User found in Patient collection:', user);
      }
    }

    // Dacă nu e Patient, caută în colecția Doctor
    if (!user) {
      user = await Doctor.findOne({ email });
      if (user) {
        userType = 'Doctor';
        console.log('User found in Doctor collection:', user);
      }
    }

    // Dacă nu s-a găsit utilizatorul
    if (!user) {
      console.log('User not found in any collection');
      return res.status(401).json({ error: 'Invalid credentials. User does not exist.' });
    }

    // Verifică parola
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('Password mismatch for user:', user.email);
      return res.status(401).json({ error: 'Invalid credentials. Password is wrong' });
    }

    console.log('Password matched for user:', user);
    // Generează token-ul JWT
    const token = jwt.sign(
      { id: user._id, type: userType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token-ul expiră în 1 oră
    );

    // Returnează token-ul și tipul utilizatorului
    res.json({ token, userType });
  } catch (error) {
    console.error('Failed authentification: ', error);
    res.status(500).json({ error: 'Server error at authentification' });
  }
});

const { authMiddleware } = require('../middleware/auth');

router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({ message: 'Token valid', id: req.user.id, role: req.user.type });
  } catch (error) {
    console.error('Failed to obtain user information:', error);
    res.status(500).json({ error: 'Server failed to obtain user information' });
  }
});
module.exports = router;