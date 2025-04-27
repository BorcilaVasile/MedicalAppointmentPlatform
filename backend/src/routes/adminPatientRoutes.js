const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Patient = require('../models/Patient');
const { authMiddleware } = require('../middleware/auth');

// Get all patients with pagination
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Case-insensitive check for admin role
    if (!req.user.type || req.user.type.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get patients with pagination
    const [patients, total] = await Promise.all([
      Patient.find()
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Patient.countDocuments()
    ]);

    res.json({
      patients,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: 'Error fetching patients', error: error.message });
  }
});

// Add a new patient (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Case-insensitive check for admin role
    if (!req.user.type || req.user.type.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const { name, email, password, phone, address, gender } = req.body;

    // Validate required fields
    if (!name || !email || !gender) {
      return res.status(400).json({ message: 'Name, email, and gender are required' });
    }

    // Check if email already exists
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Create new patient
    const patient = new Patient({
      name,
      email,
      password: password || 'password123', // Default password if not provided
      phone,
      address,
      gender
    });

    await patient.save();

    res.status(201).json({ 
      message: 'Patient created successfully',
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email
      }
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ message: 'Error creating patient', error: error.message });
  }
});

// Delete a patient (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Case-insensitive check for admin role
    if (!req.user.type || req.user.type.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ message: 'Error deleting patient', error: error.message });
  }
});

// Get patient details (admin only)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    // Case-insensitive check for admin role
    if (!req.user.type || req.user.type.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const patient = await Patient.findById(req.params.id).select('-password');
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient details:', error);
    res.status(500).json({ message: 'Error fetching patient details', error: error.message });
  }
});

module.exports = router; 