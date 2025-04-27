const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');
const { format, parseISO, startOfDay, endOfDay } = require('date-fns');
const { authMiddleware } = require('../middleware/auth');



router.get('/', authMiddleware, async (req, res) => {
    try {
        const doctorId = req.user.id; // 🔥 FIX

        const { startDate, endDate } = req.query;

        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({ error: 'ID doctor invalid' });
        }

        const query = {
            doctor: doctorId,
            status: { $ne: 'cancelled' }
        };

        if (startDate && endDate) {
            query.date = {
                $gte: startOfDay(parseISO(startDate)),
                $lte: endOfDay(parseISO(endDate))
            };
        }

        const appointments = await Appointment.find(query)
            .populate('patient')
            .populate('clinic')
            .sort({ date: 1, time: 1 })
            .lean();


        console.log('Appointments:', appointments);
        for(const appointment of appointments) {
            console.log('Appointment for: ', appointment.patient.name);
        }

        res.status(200).json({ appointments });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Server error' });
    }
});



module.exports = router;