const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Clinic = require('../models/Clinic');
const Doctor = require('../models/Doctor');
const mongoose = require('mongoose');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

// Get all clinics with pagination
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Case-insensitive check for admin role
    if (!req.user.type || req.user.type.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get clinics with pagination
    const [clinics, total] = await Promise.all([
      Clinic.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Clinic.countDocuments()
    ]);

    res.json({
      clinics,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching clinics:', error);
    res.status(500).json({ message: 'Error fetching clinics', error: error.message });
  }
});

// Add a new clinic (admin only)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    console.log('POST /api/admin/clinics - Request received:', {
      user: req.user,
      body: req.body,
      file: req.file ? { filename: req.file.filename, path: req.file.path } : 'No file uploaded',
    });

    if (!req.user.type || req.user.type.toLowerCase() !== 'admin') {
      console.log('Access denied - User is not admin:', req.user);
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const { name, address, phone, description } = req.body;
    console.log('Extracted body fields:', { name, address, phone, description });

    // Validare câmpuri obligatorii
    if (!name || !address || !phone || !req.file) {
      const errorMessage = !name ? 'Name is required' :
                          !address ? 'Address is required' :
                          !phone ? 'Phone is required' :
                          'Image is required';
      console.log('Validation failed:', errorMessage);
      return res.status(400).json({ message: errorMessage });
    }

    // Verifică dacă clinica există deja
    console.log('Checking for existing clinic with name:', name);
    const existingClinic = await Clinic.findOne({ name });
    if (existingClinic) {
      console.log('Clinic already exists:', existingClinic);
      return res.status(400).json({ message: 'Clinic already exists' });
    }

    // Creează clinica
    console.log('Creating new clinic...');
    const clinic = new Clinic({
      name,
      address,
      phone,
      description: description || '',
      image: req.file.path,
    });

    await clinic.save();
    console.log('Clinic saved successfully:', clinic);

    res.status(201).json({
      message: 'Clinic created successfully',
      clinic: {
        id: clinic._id,
        name: clinic.name,
        address: clinic.address,
        phone: clinic.phone,
        description: clinic.description,
        image: clinic.image,
      },
    });
  } catch (error) {
    console.error('Error creating clinic:', error);
    res.status(500).json({ message: 'Error creating clinic', error: error.message });
  }
});

// Delete a clinic (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Case-insensitive check for admin role
    if (!req.user.type || req.user.type.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) {
      console.log('The clinic was not found');
      return res.status(404).json({ message: 'Clinic not found' });
    }

    await Clinic.findByIdAndDelete(req.params.id);
    res.json({ message: 'Clinic deleted successfully' });
  } catch (error) {
    console.error('Error deleting clinic:', error);
    res.status(500).json({ message: 'Error deleting clinic', error: error.message });
  }
});

// Get clinic details (admin only)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    // Case-insensitive check for admin role
    if (!req.user.type || req.user.type.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }

    res.json(clinic);
  } catch (error) {
    console.error('Error fetching clinic details:', error);
    res.status(500).json({ message: 'Error fetching clinic details', error: error.message });
  }
});

module.exports = router; 