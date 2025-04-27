const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const { authMiddleware }=require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const UnavailableSlot = require('../models/UnavailableSlots');


router.get('/', authMiddleware , async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.user.id)
        .populate('clinic')
        .populate('specialty')
        .select('-password');
        if (!doctor) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(doctor);
    }
    catch (error) {
        console.error('Error fetching user(doctor) info:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const upload = multer({ dest: 'uploads/' });

router.put('/', authMiddleware,
    upload.single('profilePicture'),[
        check('firstName').optional().notEmpty().withMessage('Numele este obligatoriu'),
        check('lastName').optional().notEmpty().withMessage('Prenumele este obligatoriu'),
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
            firstName: req.body.firstName, // Garantat să existe după validare
            lastName: req.body.lastName, // Garantat să existe după validare
            email: req.body.email, // Garantat să existe după validare
            ...(req.body.phone && { phone: req.body.phone }),
            ...(req.body.address && { address: req.body.address }),
            ...(req.file && { profilePicture: `/uploads/${req.file.filename}` })
          };
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        const updatedDoctor = await Doctor.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedDoctor) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.status(200).json({
            message: 'Doctor information updated successfully',
            doctor: updatedDoctor
        });
    } catch (error) {
        console.error('Error updating doctor\'s information:', error);
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
  
      const doctor = await Doctor.findById(req.user.id);
      if (!doctor) {
        return res.status(404).json({ message: 'Doctorul nu a fost găsit' });
      }
  
      const isMatch = await bcrypt.compare(currentPassword, doctor.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Parola curentă este incorectă' });
      }
  
      doctor.password = newPassword;
      await doctor.save();
  
      res.status(200).json({ message: 'Parola a fost schimbată cu succes!' });
    } catch (error) {
      console.error('Eroare schimbare parolă:', error);
      res.status(500).json({ message: 'Eroare internă' });
    }
  });
  

  router.post('/unavailable-slots', authMiddleware, async (req, res) => {
    try {
      const newSlot = new UnavailableSlot({
        doctor: req.user.id,
        ...req.body
      });
      await newSlot.save();
      res.status(200).json(newSlot);
    } catch (error) {
      res.status(500).json({ message: 'Error adding unavailable slot', error: error.message });
    }
  });


  router.get('/unavailable-slots', authMiddleware , async (req, res) => {
      try {
        const { startDate, endDate } = req.query;
        const slots = await UnavailableSlot.find({
          doctor: req.user.id,
          date: { $gte: new Date(startDate), $lte: new Date(endDate) }
        });
        res.json(slots);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching unavailable slots', error: error.message });
      }
    });

    router.delete('/unavailable-slots/:slotId', authMiddleware, async (req, res) => {
      try {
        const { slotId } = req.params;
    
        // Find and delete the unavailable slot
        const slot = await UnavailableSlot.findOneAndDelete({
          _id: slotId,
          doctor: req.user.id // Ensure the slot belongs to the authenticated doctor
        });
    
        if (!slot) {
          return res.status(404).json({ message: 'Unavailable slot not found or you do not have permission to delete it' });
        }
    
        res.status(200).json({ message: 'Unavailable slot deleted successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Error deleting unavailable slot', error: error.message });
      }
    });

    router.put('/unavailable-slots/:slotId', authMiddleware, async (req, res) => {
      try {
        const {slotId}= req.params;
        const updatedSlot = await UnavailableSlot.findOneAndUpdate(
          { _id: slotId, doctor: req.user.id }, // Add doctor validation
          req.body,
          { new: true, runValidators: true }
        );

        if (!updatedSlot) {
          return res.status(404).json({ message: 'Unavailable slot not found or you do not have permission to update it' });
        }
        
        res.status(200).json(updatedSlot);
      } catch (error) {
        res.status(500).json({ message: 'Error updating unavailable slot', error: error.message });
      }
    });
  
module.exports = router;