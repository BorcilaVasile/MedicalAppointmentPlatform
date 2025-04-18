const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');
const { format, parseISO, startOfDay, endOfDay } = require('date-fns');
const { authMiddleware } = require('../middleware/auth');

// Ruta publică pentru obținerea programărilor unui doctor
router.get('/doctor/:id', async (req, res) => {
    try {
        const doctorId = req.params.id;
        const { startDate, endDate } = req.query;

        console.log('Doctor ID:', doctorId);
        console.log('Start Date:', startDate);
        console.log('End Date:', endDate);
        
        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({ error: 'ID doctor invalid' });
        }

        // Construiește query-ul
        const query = { 
            doctor: doctorId,
            status: { $ne: 'cancelled' }
        };

        // Filtrare pe interval de date
        if (startDate && endDate) {
            query.date = {
                $gte: startOfDay(parseISO(startDate)),
                $lte: endOfDay(parseISO(endDate))
            };
        }

        const appointments = await Appointment.find(query)
            .populate('patient', 'firstName lastName')
            .populate('clinic', 'name address')
            .sort({ date: 1, time: 1 })
            .lean();

        // Structurare date pentru frontend
        const result = {
            bookedSlots: {},
            userAppointments: {},
            appointments: appointments
        };

        appointments.forEach(appointment => {
            const dateStr = format(appointment.date, 'yyyy-MM-dd');
            
            // Sloturi rezervate
            if (!result.bookedSlots[dateStr]) {
                result.bookedSlots[dateStr] = [];
            }
            result.bookedSlots[dateStr].push(appointment.time);
            
            // Programări ale utilizatorului curent (dacă e autentificat)
            if (req.user && appointment.patient._id.toString() === req.user.id) {
                if (!result.userAppointments[dateStr]) {
                    result.userAppointments[dateStr] = {};
                }
                result.userAppointments[dateStr][appointment.time] = appointment._id;
            }
        });

        res.status(200).json(result);

    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Ruta pentru crearea unei noi programări
router.post('/', authMiddleware ,
    [
        body('doctorId').notEmpty().isMongoId(),
        body('clinicId').notEmpty().isMongoId(),
        body('date').notEmpty().isISO8601(),
        body('time').notEmpty().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        body('reason').trim().isLength({ min: 10, max: 500 })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            console.log('Creating appointment with data:', req.body);
            const { doctorId, date, time, reason, clinicId } = req.body;

            // Verificare disponibilitate
            const existingAppointment = await Appointment.findOne({
                doctor: doctorId,
                date: startOfDay(parseISO(date)),
                time,
                status: { $ne: 'cancelled' }
            });

            if (existingAppointment) {
                console.log('Time slot already booked:', existingAppointment);
                return res.status(400).json({ error: 'Time slot already booked' });
            }

            // Creare programare
            const newAppointment = new Appointment({
                doctor: doctorId,
                patient: req.user.id,
                clinic: clinicId,
                date: parseISO(date),
                time,
                reason,
                status: 'confirmed'
            });

            await newAppointment.save();

            // Populare date pentru răspuns
            const populatedAppointment = await Appointment.findById(newAppointment._id)
                .populate('patient', 'name')
                .populate('doctor', 'name')
                .populate('clinic', 'name address');

            res.status(201).json({
                message: 'Appointment created successfully',
                appointment: populatedAppointment
            });

        } catch (error) {
            console.error('Error creating appointment:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// Ruta pentru anularea unei programări
router.put('/:id/cancel', authMiddleware, async (req, res) => {
    try {
        const appointment = await Appointment.findOneAndUpdate(
            {
                _id: req.params.id,
                patient: req.user.id, // Doar pacientul poate anula propria programare
                status: { $in: ['pending', 'confirmed'] } // Doar anularea programărilor nefinalizate
            },
            { status: 'cancelled' },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found or cannot be cancelled' });
        }

        res.json({
            message: 'Appointment cancelled successfully',
            appointment
        });

    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/user', authMiddleware, async (req, res) => {
    try {
        const appointments = await Appointment.find({ patient: req.user.id })
            .populate('doctor', 'firstName lastName')
            .populate('clinic', 'name address')
            .sort({ date: 1, time: 1 })
            .lean();
        console.log(appointments);
        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching user appointments:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;