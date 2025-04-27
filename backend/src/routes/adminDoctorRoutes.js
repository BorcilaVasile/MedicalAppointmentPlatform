const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Doctor = require('../models/Doctor');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

// Get all doctors with pagination
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Case-insensitive check for admin role
    if (!req.user.type || req.user.type.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get doctors with pagination
    const [doctors, total] = await Promise.all([
      Doctor.find()
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Doctor.countDocuments()
    ]);

    res.json({
      doctors,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
});

// Add a new doctor (admin only)
router.post('/', authMiddleware, upload.fields([{ name: 'image' }]), async (req, res) => {
  try {
    // Case-insensitive check for admin role
    if (!req.user.type || req.user.type.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    // Datele din FormData sunt în req.body pentru câmpurile non-fișier și req.file pentru imagine
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      gender,
      specialty,
      clinic,
      description
    } = req.body;

    // Validare câmpuri obligatorii
    if (!firstName || !lastName || !email || !gender) {
      return res.status(400).json({
        message:
          !firstName ? 'Firstname is required' :
          !lastName ? 'Lastname is required' :
          !email ? 'Email is required' :
          'Gender is required',
      });
    }

    // Verifică dacă email-ul există deja
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Creează doctorul
    const doctor = new Doctor({
      firstName,
      lastName,
      email,
      password: password || 'password123',
      phone,
      address,
      gender,
      specialty,
      clinic,
      description,
      image: req.files?.image ? req.files.image[0].buffer : null, // Imaginea, dacă există
    });

    await doctor.save();

    res.status(201).json({
      message: 'Doctor created successfully',
      doctor: {
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
      },
    });
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ message: 'Error creating doctor', error: error.message });
  }
});

// Delete a doctor (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Case-insensitive check for admin role
    if (!req.user.type || req.user.type.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ message: 'Error deleting doctor', error: error.message });
  }
});

// Get patient details (admin only)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    // Case-insensitive check for admin role
    if (!req.user.type || req.user.type.toLowerCase() !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const doctor = await Doctor.findById(req.params.id).select('-password');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor details:', error);
    res.status(500).json({ message: 'Error fetching doctor details', error: error.message });
  }
});

module.exports = router; 