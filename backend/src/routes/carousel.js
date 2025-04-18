const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Carousel = require('../models/Carousel');

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

// Creează folderul uploads dacă nu există
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// GET: Preia toate imaginile din carusel
router.get('/', async (req, res) => {
  try {
    const images = await Carousel.find();
    res.json(images.map((item) => item.imageUrl));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Adaugă mai multe imagini în carusel
router.post('/', upload.array('image'), async (req, res) => {
  try {
    const files = req.files; // `req.files` conține un array cu fișierele încărcate
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'Niciun fișier nu a fost încărcat' });
    }

    // Creează un array de obiecte Carousel pentru fiecare fișier
    const carouselItems = files.map((file) => ({
      imageUrl: `/uploads/${file.filename}`,
    }));

    // Inserează toate imaginile în baza de date
    const newItems = await Carousel.insertMany(carouselItems);
    res.status(201).json(newItems);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST: Adaugă o imagine prin URL (opțional, pentru cereri JSON)
router.post('/url', async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ message: 'imageUrl este obligatoriu' });
  }

  const carouselItem = new Carousel({ imageUrl });

  try {
    const newItem = await carouselItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;