const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { format } = require('date-fns');
const Notification = require('../models/Notification');
const { createNotification } = require('../controllers/notificationController');

// GET: Preia toate programările unui doctor
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.params.doctorId })
      .populate('patient', 'name email phone')
      .populate('clinic', 'name address')
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

// GET: Preia sloturile rezervate pentru un doctor într-un interval de date
router.get('/slots/:doctorId', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const doctorId = req.params.doctorId;

    // Verifică dacă doctorul există
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctorul nu a fost găsit' });
    }

    // Găsește toate programările în intervalul specificat
    const appointments = await Appointment.find({
      doctor: doctorId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      status: { $ne: 'cancelled' }
    });

    // Organizează programările pe zile
    const bookedSlots = {};
    const userAppointments = {};
    
    appointments.forEach(appointment => {
      const dateStr = format(appointment.date, 'yyyy-MM-dd');
      
      // Inițializează arrays/objects dacă nu există
      if (!bookedSlots[dateStr]) {
        bookedSlots[dateStr] = [];
      }
      if (!userAppointments[dateStr]) {
        userAppointments[dateStr] = {};
      }

      // Adaugă timpul în sloturile rezervate
      bookedSlots[dateStr].push(appointment.time);
      
      // Verifică dacă programarea aparține utilizatorului curent
      if (appointment.patient && appointment.patient.toString() === req.user?.id) {
        userAppointments[dateStr][appointment.time] = appointment._id.toString();
      }
    });

    res.json({ bookedSlots, userAppointments });
  } catch (error) {
    console.error('Error fetching booked slots:', error);
    res.status(500).json({ message: 'Error fetching booked slots' });
  }
});

// GET: Preia programările unui utilizator
router.get('/user', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate('doctor', 'name specialty')
      .populate('clinic', 'name address')
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    res.status(500).json({ message: 'Error fetching user appointments' });
  }
});

// POST: Creează o nouă programare
router.post('/', auth, async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;

    // Verifică dacă doctorul există
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctorul nu a fost găsit' });
    }

    // Verifică dacă slotul este disponibil
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      time: time,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Acest slot este deja rezervat' });
    }

    const appointment = new Appointment({
      doctor: doctorId,
      patient: req.user.id,
      date: new Date(date),
      time,
      reason,
      status: 'pending'
    });

    await appointment.save();

    // Create notification for the doctor
    await createNotification(
      doctorId,
      req.user.id,
      'APPOINTMENT_CREATED',
      appointment._id,
      `Aveți o nouă programare pentru ${format(new Date(date), 'dd/MM/yyyy')} la ora ${time}.`
    );

    // Create notification for the patient
    await createNotification(
      req.user.id,
      doctorId,
      'APPOINTMENT_CONFIRMED',
      appointment._id,
      `Programarea dumneavoastră pentru ${format(new Date(date), 'dd/MM/yyyy')} la ora ${time} a fost confirmată.`
    );

    res.status(201).json({
      message: 'Programarea a fost creată cu succes',
      appointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Error creating appointment' });
  }
});

// PUT: Actualizează o programare
router.put('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Programarea nu a fost găsită' });
    }

    // Verifică dacă utilizatorul are dreptul să modifice programarea
    if (appointment.patient.toString() !== req.user.id && 
        appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Nu aveți permisiunea să modificați această programare' });
    }

    Object.assign(appointment, req.body);
    await appointment.save();

    res.json({
      message: 'Programarea a fost actualizată cu succes',
      appointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Error updating appointment' });
  }
});

// DELETE: Șterge o programare
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Programarea nu a fost găsită' });
    }

    // Verifică dacă utilizatorul are dreptul să șteargă programarea
    if (appointment.patient.toString() !== req.user.id && 
        appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Nu aveți permisiunea să ștergeți această programare' });
    }

    await appointment.remove();

    res.json({ message: 'Programarea a fost ștearsă cu succes' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Error deleting appointment' });
  }
});

module.exports = router; 