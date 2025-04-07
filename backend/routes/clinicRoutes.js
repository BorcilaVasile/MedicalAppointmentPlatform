const express = require('express');
const router = express.Router();
const Clinic = require('../models/Clinic');
const Doctor = require('../models/Doctor');

// GET: Preia toate clinicile
router.get('/', async (req, res) => {
  try {
    const clinics = await Clinic.find();
    res.json(clinics);
  } catch (error) {
    res.status(500).json({ message: 'Eroare la preluarea clinicilor', error: error.message });
  }
});

// GET: Preia o clinică specifică după ID
router.get('/:id', async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) {
      return res.status(404).json({ message: 'Clinica nu a fost găsită' });
    }
    res.json(clinic);
  } catch (error) {
    res.status(500).json({ message: 'Eroare la preluarea clinicii', error: error.message });
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

module.exports = router; 