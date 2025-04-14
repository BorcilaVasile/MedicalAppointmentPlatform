const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET: Preia toate recenziile unui doctor
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const reviews = await Review.find({ doctor: req.params.doctorId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// POST: Creează o nouă recenzie
router.post('/', auth, async (req, res) => {
  try {
    const { doctorId, rating, comment } = req.body;

    // Verifică dacă doctorul există
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctorul nu a fost găsit' });
    }

    // Verifică dacă utilizatorul a mai lăsat o recenzie pentru acest doctor
    const existingReview = await Review.findOne({
      doctor: doctorId,
      user: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Ați lăsat deja o recenzie pentru acest doctor' });
    }

    const review = new Review({
      doctor: doctorId,
      user: req.user.id,
      rating,
      comment
    });

    await review.save();

    res.status(201).json({
      message: 'Recenzia a fost adăugată cu succes',
      review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Error creating review' });
  }
});

// PUT: Actualizează o recenzie
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Recenzia nu a fost găsită' });
    }

    // Verifică dacă utilizatorul are dreptul să modifice recenzia
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Nu aveți permisiunea să modificați această recenzie' });
    }

    Object.assign(review, req.body);
    await review.save();

    res.json({
      message: 'Recenzia a fost actualizată cu succes',
      review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Error updating review' });
  }
});

// DELETE: Șterge o recenzie
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Recenzia nu a fost găsită' });
    }

    // Verifică dacă utilizatorul are dreptul să șteargă recenzia
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Nu aveți permisiunea să ștergeți această recenzie' });
    }

    await review.remove();

    res.json({ message: 'Recenzia a fost ștearsă cu succes' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Error deleting review' });
  }
});

module.exports = router; 