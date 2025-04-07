const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Clinic = require('../models/Clinic');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Middleware pentru verificarea rolului de admin
router.use(auth, admin);

// GET: Statistici pentru dashboard
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      users: await User.countDocuments({ role: { $ne: 'admin' } }),
      doctors: await Doctor.countDocuments(),
      clinics: await Clinic.countDocuments(),
      appointments: await Appointment.countDocuments({ status: { $ne: 'anulat' } })
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// GET: Lista utilizatorilor
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// GET: Lista doctorilor cu detalii
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .sort({ createdAt: -1 });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors' });
  }
});

// GET: Lista clinicilor cu detalii
router.get('/clinics', async (req, res) => {
  try {
    const clinics = await Clinic.find()
      .sort({ createdAt: -1 });
    res.json(clinics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clinics' });
  }
});

// GET: Lista programărilor cu detalii
router.get('/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('userId', 'name email')
      .populate('doctorId', 'name specialty')
      .sort({ date: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

// DELETE: Șterge un utilizator
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// DELETE: Șterge un doctor
router.delete('/doctors/:id', async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting doctor' });
  }
});

// DELETE: Șterge o clinică
router.delete('/clinics/:id', async (req, res) => {
  try {
    await Clinic.findByIdAndDelete(req.params.id);
    res.json({ message: 'Clinic deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting clinic' });
  }
});

module.exports = router; 