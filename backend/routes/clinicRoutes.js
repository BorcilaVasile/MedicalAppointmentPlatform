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

// GET: Preia toate clinicile
router.get('/', async (req, res) => {
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
  } catch (err) {
    console.error('Error fetching clinics:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET: Preia o clinică specifică după ID
router.get('/:id', async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id).populate('doctors');
    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }
    res.json(clinic);
  } catch (err) {
    console.error('Error fetching clinic:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET: Preia toți doctorii asociați cu o clinică
router.get('/:id/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find({ clinic: req.params.id }).select('-password');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Eroare la preluarea doctorilor', error: error.message });
  }
});

// Creează o clinică nouă (doar admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, address, phone, description, image } = req.body;

    const clinic = new Clinic({
      name,
      address,
      phone,
      description,
      image
    });

    const newClinic = await clinic.save();
    res.status(201).json(newClinic);
  } catch (err) {
    console.error('Error creating clinic:', err);
    res.status(400).json({ message: err.message });
  }
});

// Actualizează o clinică (doar admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }

    Object.assign(clinic, req.body);
    const updatedClinic = await clinic.save();
    res.json(updatedClinic);
  } catch (err) {
    console.error('Error updating clinic:', err);
    res.status(400).json({ message: err.message });
  }
});

// Șterge o clinică (doar admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }

    await clinic.remove();
    res.json({ message: 'Clinic deleted successfully' });
  } catch (err) {
    console.error('Error deleting clinic:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 