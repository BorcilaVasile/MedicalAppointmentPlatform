const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const reviewSchema = new mongoose.Schema({
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
});

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: false },
  gender: { type: String, enum: ['Masculin', 'Feminin', 'Altul'], required: true },
  reviews: [reviewSchema],
});

module.exports = mongoose.model('Doctor', doctorSchema);