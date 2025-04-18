const express = require('express');
const router = express.Router();
const Speciality = require('../models/Speciality');

router.get('/', async (req, res) => {
    try {
        const specialties = await Speciality.find();
        res.status(200).json(specialties);
    }
    catch (error) {
        console.error('Error fetching specialties:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;