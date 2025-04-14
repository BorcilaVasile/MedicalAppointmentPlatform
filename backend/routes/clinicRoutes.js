const express = require('express');
const router = express.Router();
const Clinic = require('../models/Clinic');
const Doctor = require('../models/Doctor');
const authMiddleware = require('../middleware/auth');

// Middleware pentru verificarea rolului de admin
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

// Get all clinics with pagination
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [clinics, total] = await Promise.all([
      Clinic.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('doctors', 'name specialty'),
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

// Get clinic by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id)
      .populate('doctors', 'name specialty');
    
    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }
    
    res.json(clinic);
  } catch (error) {
    console.error('Error fetching clinic:', error);
    res.status(500).json({ message: 'Error fetching clinic', error: error.message });
  }
});

// Get all doctors associated with a clinic
router.get('/:id/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find({ clinic: req.params.id }).select('-password');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Eroare la preluarea doctorilor', error: error.message });
  }
});

// Create new clinic
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, address, phone, description, image } = req.body;

    const clinic = new Clinic({
      name,
      address,
      phone,
      description,
      image
    });

    const savedClinic = await clinic.save();
    res.status(201).json(savedClinic);
  } catch (error) {
    console.error('Error creating clinic:', error);
    res.status(500).json({ message: 'Error creating clinic', error: error.message });
  }
});

// Update clinic
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const clinic = await Clinic.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('doctors', 'name specialty');

    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }

    res.json(clinic);
  } catch (error) {
    console.error('Error updating clinic:', error);
    res.status(500).json({ message: 'Error updating clinic', error: error.message });
  }
});

// Delete clinic
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const clinic = await Clinic.findByIdAndDelete(req.params.id);
    
    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }
    
    res.json({ message: 'Clinic deleted successfully' });
  } catch (error) {
    console.error('Error deleting clinic:', error);
    res.status(500).json({ message: 'Error deleting clinic', error: error.message });
  }
});

module.exports = router; 