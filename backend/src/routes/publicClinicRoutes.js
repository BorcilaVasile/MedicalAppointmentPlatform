const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Clinic = require('../models/Clinic');
const Doctor = require('../models/Doctor');
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
    try {
        const clinics = await Clinic.find();
        res.status(200).json(clinics);
    }
    catch (error) {
        console.error('Error fetching clinics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:id', async (req, res) => { 
    try {
        const clinic = await Clinic.findById(req.params.id);
        res.status(200).json(clinic); 
    }
    catch(error){ 
        console.error('Error fetching clinic\'s informations'); 
        res.status(500).json({error: 'Internal server error'});
    }
})

router.get('/:id/doctors', async (req, res) => {
     try {
            const clinicId = req.params.id;
    
            if (!mongoose.Types.ObjectId.isValid(clinicId)) 
                return res.status(400).json({ error: 'Invalid clinic ID' });
            const doctors = await Doctor.find({ clinic: clinicId }).populate('specialty').sort({ createdAt: -1 });
            res.status(200).json(doctors);
        }
        catch (error) {
            console.error('Error fetching doctors:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
})

module.exports = router;