const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Clinic = require('../models/Clinic');

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

// GET: Preia toate clinicile
router.get('/', async (req, res) => {
  try {
    const clinics = await Clinic.find();
    res.json(clinics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Adaugă o clinică nouă (cu imagine și câmpuri text)
router.post('/', upload.single('image'), async (req, res) => {
  const { name, address } = req.body;
  if (!name || !address || !req.file) {
    return res.status(400).json({ message: 'name, address și image sunt obligatorii' });
  }

  const image = `/uploads/${req.file.filename}`;
  const clinic = new Clinic({ name, address, image });

  try {
    const newClinic = await clinic.save();
    res.status(201).json(newClinic);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST: Adaugă mai multe clinici noi prin URL (acceptă un array)
router.post('/url', async (req, res) => {
  const clinics = req.body;
  if (!Array.isArray(clinics)) {
    return res.status(400).json({ message: 'Aștept un array de clinici' });
  }

  const newClinics = clinics.map((clinic) => {
    const { name, address, image } = clinic;
    if (!name || !address || !image) {
      throw new Error('name, address și image sunt obligatorii pentru fiecare clinică');
    }
    return { name, address, image };
  });

  try {
    const savedClinics = await Clinic.insertMany(newClinics);
    res.status(201).json(savedClinics);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE: Șterge o clinică pe baza ID-ului
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const clinic = await Clinic.findById(id);
    if (!clinic) {
      return res.status(404).json({ message: 'Clinica nu a fost găsită' });
    }
    await Clinic.findByIdAndDelete(id);
    res.json({ message: 'Clinica a fost ștearsă cu succes' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;