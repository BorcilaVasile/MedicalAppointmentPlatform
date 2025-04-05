const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Doctor = require('../models/Doctor');

// Configurare multer pentru stocarea imaginilor
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// GET: Preia toți doctorii
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET: Preia un doctor specific
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctorul nu a fost găsit' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Adaugă un doctor nou (cu suport pentru imagine)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, specialty, description, gender } = req.body;

    // Validare simplă
    if (!name || !specialty || !description || !gender) {
      return res.status(400).json({ message: 'Toate câmpurile obligatorii trebuie completate.' });
    }

    const newDoctor = new Doctor({
      name,
      specialty,
      description,
      gender,
      image: req.file ? `/uploads/${req.file.filename}` : '', // Imaginea este opțională
    });

    const savedDoctor = await newDoctor.save();
    res.status(201).json(savedDoctor);
  } catch (error) {
    console.error('Eroare la salvarea doctorului:', error.message);
    res.status(500).json({ message: 'Eroare la salvarea doctorului.', error: error.message });
  }
});

// PUT: Actualizează un doctor
router.put('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctorul nu a fost găsit' });

    doctor.name = req.body.name || doctor.name;
    doctor.specialty = req.body.specialty || doctor.specialty;
    doctor.description = req.body.description || doctor.description;
    doctor.image = req.body.image || doctor.image;
    doctor.reviews = req.body.reviews || doctor.reviews;

    const updatedDoctor = await doctor.save();
    res.json(updatedDoctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE: Șterge un doctor
router.delete('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctorul nu a fost găsit' });

    await doctor.remove();
    res.json({ message: 'Doctorul a fost șters' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Adaugă un review pentru un doctor
router.post('/:id/reviews', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctorul nu a fost găsit' });

    const review = {
      rating: req.body.rating,
      comment: req.body.comment,
    };

    doctor.reviews.push(review);
    await doctor.save();
    res.status(201).json(doctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;