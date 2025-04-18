const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const { authMiddleware } = require('../middleware/auth');

router.post('/', 
    authMiddleware,
    [
      body('doctorId')
        .notEmpty().withMessage('ID doctor este obligatoriu')
        .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('ID doctor invalid'),
      body('rating')
        .optional()
        .isInt({ min: 1, max: 5 }).withMessage('Rating trebuie să fie între 1-5'),
      body('comment')
        .trim()
        .isLength({ min: 10, max: 500 }).withMessage('Comentariul trebuie să aibă între 10-500 caractere')
    ],
    async (req, res) => {
      try {
        // Validare
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
  
        // Verificare recenzie existentă
        const existingReview = await Review.findOne({
          doctor: req.body.doctorId,
          user: req.user.id
        });
  
        if (existingReview) {
          return res.status(400).json({ 
            error: 'Ați lăsat deja o recenzie acestui doctor' 
          });
        }
  
        // Creare recenzie (cu rating default 5 dacă nu e specificat)
        const newReview = new Review({
          doctor: req.body.doctorId,
          user: req.user.id,
          rating: req.body.rating || 5, // Default 5 dacă nu se trimite
          comment: req.body.comment
        });
  
        const savedReview = await newReview.save();
        
        // Populare date pentru răspuns
        const populatedReview = await Review.findById(savedReview._id)
          .populate('user', 'firstName lastName profilePicture')
          .populate('doctor', 'name specialization');
  
        res.status(201).json({
          message: 'Recenzie adăugată cu succes',
          review: populatedReview
        });
  
      } catch (error) {
        console.error('Eroare adăugare recenzie:', error);
        res.status(500).json({ 
          error: error.message || 'Eroare server la adăugarea recenziei' 
        });
      }
    }
  );

module.exports = router;