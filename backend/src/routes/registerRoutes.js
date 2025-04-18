const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');

// POST /api/patients
router.post('/', async (req, res) => {
    const { email, password, name, gender } = req.body;
  
    if (!name || !email || !password || !gender) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    try {
  
      // Verifică dacă email-ul e deja folosit
      const existing = await Patient.findOne({ email });
      if (existing) {
        return res.status(409).json({ error: 'This email is already registered.' });
      }
  
      // Creează noul utilizator
      const user = new Patient({ name, email, password, gender });
      console.log('Saving patient...');
      await user.save(); // aici parola e hash-uită automat
      console.log('Saved patient:', user);
  
      const userType = 'Patient';
      // Generează token
      const token = jwt.sign(
        { id: user._id, type: userType },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      console.log('Sending success response...');
      res.status(201).json({ message: 'Your account has been created succesfully', token, userType });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Registration error' });
    }
  });
  
module.exports = router;