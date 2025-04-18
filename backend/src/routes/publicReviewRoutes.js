const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Review= require('../models/Review'); 
const { authMiddleware } = require('../middleware/auth');
const mongoose=require('mongoose');
const { body, validationResult } = require('express-validator');

router.get('/:id',  async (req, res) => {
    try {
        const doctorId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(doctorId)) 
            return res.status(400).json({ error: 'Invalid doctor ID' });
        const reviews = await Review.find({ doctor: doctorId }).populate('user').sort({ createdAt: -1 });
        res.status(200).json(reviews);
    }
    catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', 
    authMiddleware,
    [
        body('doctorId')
            .notEmpty().withMessage('ID doctor este obligatoriu')
            .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('ID doctor invalid'),
        body('comment')
            .trim()
            .isLength({ min: 10 }).withMessage('Comentariul trebuie să conțină minim 10 caractere')
    ],
    async (req, res) => {
        try {
            console.log('Request body:', req.body);
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            console.log('User ID:', req.user.id);
            console.log('Doctor ID:', req.body.doctorId);
            console.log('Comment:', req.body.comment);
            console.log('Rating:', req.body.rating);
            // Creare recenzie nouă
            const newReview = new Review({
                doctor: req.body.doctorId,
                user: req.user.id,
                comment: req.body.comment,
                rating: req.body.rating,
                createdAt: new Date()
            });

            const savedReview = await newReview.save();
            
            // Populare date pentru răspuns
            const populatedReview = await Review.findById(savedReview._id)
                .populate('user', 'name email')
                .populate('doctor', 'firstName lastName');

            res.status(201).json({
                message: 'Recenzie adăugată cu succes',
                review: populatedReview
            });

        } catch (error) {
            console.error('Eroare la adăugarea recenziei:', error);
            res.status(500).json({ error: 'Eroare server' });
        }
    }
);
module.exports = router;