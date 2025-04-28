const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Doctor = require('../models/Doctor');
const Appointment=require('../models/Appointment');
const Notification=require('../models/Notification');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

// Get all doctors with pagination
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Case-insensitive check for admin role
    if (!req.user.type || req.user.type.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get doctors with pagination
    const [doctors, total] = await Promise.all([
      Doctor.find()
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Doctor.countDocuments()
    ]);

    res.json({
      doctors,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
});

// Add a new doctor (admin only)
router.post('/', authMiddleware, upload.fields([{ name: 'image' }]), async (req, res) => {
  try {
    // Case-insensitive check for admin role
    if (!req.user.type || req.user.type.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    // Datele din FormData sunt în req.body pentru câmpurile non-fișier și req.file pentru imagine
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      gender,
      specialty,
      clinic,
      description
    } = req.body;

    // Validare câmpuri obligatorii
    if (!firstName || !lastName || !email || !gender) {
      return res.status(400).json({
        message:
          !firstName ? 'Firstname is required' :
          !lastName ? 'Lastname is required' :
          !email ? 'Email is required' :
          'Gender is required',
      });
    }

    // Verifică dacă email-ul există deja
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Creează doctorul
    const doctor = new Doctor({
      firstName,
      lastName,
      email,
      password: password || 'password123',
      phone,
      address,
      gender,
      specialty,
      clinic,
      description,
      image: req.files?.image ? req.files.image[0].buffer : null, // Imaginea, dacă există
    });

    await doctor.save();

    res.status(201).json({
      message: 'Doctor created successfully',
      doctor: {
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
      },
    });
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ message: 'Error creating doctor', error: error.message });
  }
});

// Delete a doctor (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Case-insensitive check for admin role
    if (!req.user.type || req.user.type.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (doctor.active) {
      return res.status(400).json({ message: 'Cannot delete an active doctor. Please set the doctor as inactive first.' });
    }

    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ message: 'Error deleting doctor', error: error.message });
  }
});

// Get patient details (admin only)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    // Case-insensitive check for admin role
    if (!req.user.type || req.user.type.toLowerCase() !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const doctor = await Doctor.findById(req.params.id).select('-password');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor details:', error);
    res.status(500).json({ message: 'Error fetching doctor details', error: error.message });
  }
});

// Update a doctor (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('Starting doctor update for ID:', req.params.id);
    console.log('Request body:', req.body);

    // Case-insensitive check for admin role
    if (!req.user.type || req.user.type.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const { id } = req.params;
    const { lastName, password, clinic, active } = req.body;

    // Găsește doctorul existent
    console.log('Fetching doctor...');
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      console.log('Doctor not found');
      return res.status(404).json({ message: 'Doctor not found' });
    }

    console.log('Doctor found:', doctor);

    // Verifică dacă doctorul devine inactiv
    const wasActive = doctor.active; // Acum active este boolean
    const willBeInactive = active === false;
    console.log('wasActive:', wasActive, 'willBeInactive:', willBeInactive);

    // Actualizează câmpurile specificate
    if (lastName) doctor.lastName = lastName;
    if (clinic) doctor.clinic = clinic;
    if (active !== undefined) doctor.active = active;
    if (password) {
      console.log('Updating password...');
      const salt = await bcrypt.genSalt(10);
      doctor.password = await bcrypt.hash(password, salt);
    }

    // Dacă doctorul devine inactiv, anulează programările și trimite notificări
    if (wasActive && willBeInactive) {
      console.log('Doctor becoming inactive, fetching appointments...');
      const appointments = await Appointment.find({
        doctor: id,
        status: { $in: ['pending', 'confirmed'] },
        date: { $gte: new Date() },
      });
      console.log('Appointments found:', appointments.length);

      const notifications = [];
      for (const appointment of appointments) {
        console.log('Cancelling appointment:', appointment._id);
        appointment.status = 'cancelled';
        await appointment.save();

        console.log('Creating notification for appointment:', appointment._id);
        const notification = new Notification({
          recipient: appointment.patient,
          recipientType: 'Patient',
          type: 'APPOINTMENT_CANCELLED',
          appointment: appointment._id,
          message: `Your appointment with Dr. ${doctor.firstName} ${doctor.lastName} on ${appointment.date.toLocaleDateString()} has been cancelled because the doctor is no longer active.`,
          read: false,
        });
        notifications.push(notification);
      }

      if (notifications.length > 0) {
        console.log('Saving notifications:', notifications.length);
        await Notification.insertMany(notifications);
      }
    }

    // Salvează modificările
    console.log('Saving doctor changes...');
    await doctor.save();

    // Returnează doctorul actualizat (fără parolă)
    console.log('Fetching updated doctor...');
    const updatedDoctor = await Doctor.findById(id).select('-password');
    res.json({
      message: 'Doctor updated successfully',
      doctor: updatedDoctor,
    });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ message: 'Error updating doctor', error: error.message });
  }
});

module.exports = router; 