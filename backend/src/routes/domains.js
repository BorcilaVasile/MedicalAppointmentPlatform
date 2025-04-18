const express = require('express');
const router = express.Router();
const Domain = require('../models/Domain');

// GET: Preia toate domeniile medicale
router.get('/', async (req, res) => {
  try {
    const domains = await Domain.find();
    res.json(domains);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Adaugă un domeniu nou
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  const domain = new Domain({ name, description });

  try {
    const newDomain = await domain.save();
    res.status(201).json(newDomain);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;