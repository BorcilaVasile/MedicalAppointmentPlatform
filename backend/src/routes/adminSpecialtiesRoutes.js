const express = require('express');
const router = express.Router();
const Speciality = require('../models/Speciality'); // Calea către modelul tău
const {authMiddleware} = require('../middleware/auth'); // Middleware-ul tău de autentificare

// Middleware pentru a verifica rolul de admin
const isAdmin = (req, res, next) => {
  if (!req.user.type || req.user.type.toLowerCase() !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

// CREATE - Adaugă o specialitate nouă
router.post('/', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name, requirements, description } = req.body;

    // Validare câmpuri obligatorii
    if (!name || !requirements || !description) {
      return res.status(400).json({
        message: 'Name, requirements, and description are required',
      });
    }

    // Verifică dacă specialitatea există deja
    const existingSpeciality = await Speciality.findOne({ name });
    if (existingSpeciality) {
      return res.status(400).json({ message: 'Speciality already exists' });
    }

    // Creează și salvează specialitatea
    const speciality = new Speciality({ name, requirements, description });
    await speciality.save();

    res.status(201).json({
      message: 'Speciality created successfully',
      speciality: {
        id: speciality._id,
        name: speciality.name,
        requirements: speciality.requirements,
        description: speciality.description,
      },
    });
  } catch (error) {
    console.error('Error creating speciality:', error);
    res.status(500).json({ message: 'Error creating speciality', error: error.message });
  }
});

// READ - Obține toate specialitățile
router.get('/', authMiddleware, isAdmin, async (req, res) => {
  try {
    const specialities = await Speciality.find();
    res.status(200).json(specialities);
  } catch (error) {
    console.error('Error fetching specialities:', error);
    res.status(500).json({ message: 'Error fetching specialities', error: error.message });
  }
});

// READ - Obține o specialitate după ID
router.get('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const speciality = await Speciality.findById(req.params.id);
    if (!speciality) {
      return res.status(404).json({ message: 'Speciality not found' });
    }
    res.status(200).json(speciality);
  } catch (error) {
    console.error('Error fetching speciality:', error);
    res.status(500).json({ message: 'Error fetching speciality', error: error.message });
  }
});

// UPDATE - Actualizează o specialitate
router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name, requirements, description } = req.body;

    // Validare câmpuri
    if (!name || !requirements || !description) {
      return res.status(400).json({
        message: 'Name, requirements, and description are required',
      });
    }

    // Actualizează specialitatea
    const speciality = await Speciality.findByIdAndUpdate(
      req.params.id,
      { name, requirements, description },
      { new: true, runValidators: true }
    );

    if (!speciality) {
      return res.status(404).json({ message: 'Speciality not found' });
    }

    res.status(200).json({
      message: 'Speciality updated successfully',
      speciality,
    });
  } catch (error) {
    console.error('Error updating speciality:', error);
    res.status(500).json({ message: 'Error updating speciality', error: error.message });
  }
});

// DELETE - Șterge o specialitate
router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const speciality = await Speciality.findByIdAndDelete(req.params.id);
    if (!speciality) {
      return res.status(404).json({ message: 'Speciality not found' });
    }

    res.status(200).json({ message: 'Speciality deleted successfully' });
  } catch (error) {
    console.error('Error deleting speciality:', error);
    res.status(500).json({ message: 'Error deleting speciality', error: error.message });
  }
});

module.exports = router;