const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const { authMiddleware }=require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const multer = require('multer');


router.get('/', authMiddleware , async (req, res) => {
    try {
        const patient = await Patient.findById(req.user.id).select('-password');
        if (!patient) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(patient);
    }
    catch (error) {
        console.error('Error fetching user(patient) info:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const upload = multer({ dest: 'uploads/' });

router.put('/', authMiddleware,
    upload.single('profilePicture'),[
        check('name').optional().notEmpty().withMessage('Numele este obligatoriu'),
        check('email').optional().isEmail().withMessage('Email invalid'),
        check('phone').optional().isMobilePhone().withMessage('Număr de telefon invalid'),
        check('password').optional().isLength({ min: 6 }).withMessage('Parola trebuie să aibă minim 6 caractere'),
      ],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    try{

        const updateData = {
            name: req.body.name, // Garantat să existe după validare
            email: req.body.email, // Garantat să existe după validare
            ...(req.body.phone && { phone: req.body.phone }),
            ...(req.body.address && { address: req.body.address }),
            ...(req.file && { profilePicture: `/uploads/${req.file.filename}` })
          };
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        const updatedPatient = await Patient.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedPatient) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.status(200).json({
            message: 'Patient information updated successfully',
            patient: updatedPatient
        });
    } catch (error) {
        console.error('Error updating patient information:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

});

router.put('/password', authMiddleware, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
  
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Toate câmpurile sunt obligatorii' });
      }
  
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Parola nouă trebuie să aibă cel puțin 6 caractere' });
      }
  
      const patient = await Patient.findById(req.user.id);
      if (!patient) {
        return res.status(404).json({ message: 'Pacientul nu a fost găsit' });
      }
  
      const isMatch = await bcrypt.compare(currentPassword, patient.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Parola curentă este incorectă' });
      }
  
      
      patient.password = newPassword;
      await patient.save();
  
      res.status(200).json({ message: 'Parola a fost schimbată cu succes!' });
    } catch (error) {
      console.error('Eroare schimbare parolă:', error);
      res.status(500).json({ message: 'Eroare internă' });
    }
  });
  

module.exports = router;