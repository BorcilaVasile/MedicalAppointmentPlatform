const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Appointment= require('../models/Appointment');
const mongoose = require('mongoose');
const { authMiddleware } = require('../middleware/auth');


// Get all appointments with pagination
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Case-insensitive check for admin role
    if (!req.user.type || req.user.type.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get appointments with pagination
    const [appointments, total] = await Promise.all([
      Appointment.find()
        .populate({
            path: 'doctor',
            select: 'firstName lastName specialty',
            populate: { path: 'specialty', select: 'name' }, 
        })
        .populate('patient', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Appointment.countDocuments()
    ]);

    res.json({
      appointments,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
});

module.exports = router; 