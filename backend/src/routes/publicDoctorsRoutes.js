const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const Clinic = require('../models/Clinic');
const Speciality = require('../models/Speciality');

router.get('/', async (req, res) => {
    try {
        const doctors = await Doctor.find().populate('clinic').populate('specialty');
        res.status(200).json(doctors);
    }
    catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:id', async(req, res) => 
{ 
    try{
        const doctor = await Doctor.findById(req.params.id).populate('clinic').populate('specialty');
        res.status(200).json(doctor);
    }
    catch(error){
        console.error('Error fetching doctor\'s informations ');
        res.status(500).json({error: 'Internal server error'});
    }
})

module.exports = router;