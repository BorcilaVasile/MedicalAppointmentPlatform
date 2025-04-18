const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Clinic = require('../models/Clinic');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const checkRole= require('../middleware/checkRole');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');

// Configurare multer pentru încărcarea imaginilor
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // limită de 5MB
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Doar fișierele imagine sunt permise!'), false);
    }
  }
});

// Middleware pentru verificarea rolului de admin
const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token lipsă' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Acces interzis - Nu aveți drepturi de admin' });
    }
    
    req.adminId = decoded.id;
    next();
  } catch (error) {
    console.error('isAdmin middleware error:', error);
    res.status(401).json({ message: 'Token invalid' });
  }
};

// Endpoint pentru statistici
router.get('/stats', auth, checkRole('admin'), async (req, res) => {
  try {
    const [users, doctors, clinics, appointments] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      Doctor.countDocuments(),
      Clinic.countDocuments(),
      Appointment.countDocuments()
    ]);

    res.json({
      users,
      doctors,
      clinics,
      appointments
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// Get detailed doctor statistics
router.get('/stats/doctors', auth, checkRole('admin'), async (req, res) => {
  try {
    const doctors = await Doctor.find().select('name specialty');
    const doctorStats = await Promise.all(
      doctors.map(async (doctor) => {
        const [
          totalAppointments,
          completedAppointments,
          cancelledAppointments,
          averageRating,
          reviewsCount
        ] = await Promise.all([
          Appointment.countDocuments({ doctor: doctor._id }),
          Appointment.countDocuments({ doctor: doctor._id, status: 'completed' }),
          Appointment.countDocuments({ doctor: doctor._id, status: 'cancelled' }),
          Review.aggregate([
            { $match: { doctor: doctor._id } },
            { $group: { _id: null, average: { $avg: '$rating' } } }
          ]),
          Review.countDocuments({ doctor: doctor._id })
        ]);

        return {
          _id: doctor._id,
          name: doctor.name,
          specialty: doctor.specialty,
          statistics: {
            totalAppointments,
            completedAppointments,
            cancelledAppointments,
            completionRate: totalAppointments ? (completedAppointments / totalAppointments * 100).toFixed(1) : 0,
            cancellationRate: totalAppointments ? (cancelledAppointments / totalAppointments * 100).toFixed(1) : 0,
            averageRating: averageRating[0]?.average?.toFixed(1) || 0,
            reviewsCount
          }
        };
      })
    );

    res.json(doctorStats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctor statistics' });
  }
});

// Get platform activity statistics
router.get('/stats/activity', auth, checkRole('admin'), async (req, res) => {
  try {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsersLastMonth,
      newUsersLastWeek,
      appointmentsLastMonth,
      appointmentsLastWeek,
      appointmentsByStatus,
      appointmentsBySpecialty,
      topDoctors
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: lastMonth } }),
      User.countDocuments({ createdAt: { $gte: lastWeek } }),
      Appointment.countDocuments({ createdAt: { $gte: lastMonth } }),
      Appointment.countDocuments({ createdAt: { $gte: lastWeek } }),
      Appointment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Appointment.aggregate([
        {
          $lookup: {
            from: 'doctors',
            localField: 'doctor',
            foreignField: '_id',
            as: 'doctorInfo'
          }
        },
        { $unwind: '$doctorInfo' },
        { $group: { _id: '$doctorInfo.specialty', count: { $sum: 1 } } }
      ]),
      Doctor.aggregate([
        {
          $lookup: {
            from: 'appointments',
            localField: '_id',
            foreignField: 'doctor',
            as: 'appointments'
          }
        },
        {
          $lookup: {
            from: 'reviews',
            localField: '_id',
            foreignField: 'doctor',
            as: 'reviews'
          }
        },
        {
          $project: {
            name: 1,
            specialty: 1,
            appointmentCount: { $size: '$appointments' },
            averageRating: { $avg: '$reviews.rating' }
          }
        },
        { $sort: { appointmentCount: -1 } },
        { $limit: 5 }
      ])
    ]);

    res.json({
      userStats: {
        total: totalUsers,
        newLastMonth: newUsersLastMonth,
        newLastWeek: newUsersLastWeek,
        growthRateLastMonth: ((newUsersLastMonth / totalUsers) * 100).toFixed(1)
      },
      appointmentStats: {
        lastMonth: appointmentsLastMonth,
        lastWeek: appointmentsLastWeek,
        byStatus: appointmentsByStatus,
        bySpecialty: appointmentsBySpecialty
      },
      topDoctors: topDoctors.map(doc => ({
        ...doc,
        averageRating: doc.averageRating?.toFixed(1) || 0
      }))
    });
  } catch (error) {
    console.error('Error fetching activity statistics:', error);
    res.status(500).json({ message: 'Error fetching activity statistics' });
  }
});

// GET: Preia toți doctorii (doar pentru admin)
router.get('/doctors', isAdmin, async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('-password')
      .populate('clinic', 'name address');
    res.json(doctors);
  } catch (error) {
    console.error('Eroare la listarea doctorilor:', error);
    res.status(500).json({ message: 'Eroare la listarea doctorilor', error: error.message });
  }
});

// DELETE: Șterge un doctor (doar pentru admin)
router.delete('/doctors/:id', isAdmin, async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' });
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctorul nu a fost găsit' });
    }

    // Șterge imaginea de profil dacă există
    if (doctor.profilePicture) {
      const imagePath = path.join(__dirname, '..', doctor.profilePicture);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await doctor.deleteOne();
    res.json({ message: 'Doctor șters cu succes' });
  } catch (error) {
    console.error('Eroare la ștergerea doctorului:', error);
    res.status(500).json({ message: 'Eroare la ștergerea doctorului', error: error.message });
  }
});

// GET: Preia toate clinicile (doar pentru admin)
router.get('/clinics', isAdmin, async (req, res) => {
  try {
    const clinics = await Clinic.find();
    res.json(clinics);
  } catch (error) {
    res.status(500).json({ message: 'Eroare la preluarea clinicilor', error: error.message });
  }
});

// DELETE: Șterge o clinică (doar pentru admin)
router.delete('/clinics/:id', isAdmin, async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) {
      return res.status(404).json({ message: 'Clinica nu a fost găsită' });
    }

    // Verifică dacă există doctori asociați cu această clinică
    const doctors = await Doctor.find({ clinic: req.params.id });
    if (doctors.length > 0) {
      return res.status(400).json({ 
        message: 'Nu se poate șterge clinica deoarece există doctori asociați. Vă rugăm să reassignați sau să ștergeți mai întâi doctorii.'
      });
    }

    // Șterge imaginea clinicii din sistem dacă există
    if (clinic.image) {
      const imagePath = path.join(__dirname, '..', clinic.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await clinic.deleteOne();
    res.json({ message: 'Clinica a fost ștearsă cu succes' });
  } catch (error) {
    console.error('Eroare la ștergerea clinicii:', error);
    res.status(500).json({ message: 'Eroare la ștergerea clinicii', error: error.message });
  }
});

// POST: Adaugă o clinică nouă (doar pentru admin)
router.post('/clinics', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, address, phone, description } = req.body;

    if (!name || !address || !phone || !description) {
      return res.status(400).json({ message: 'Vă rugăm să completați toate câmpurile obligatorii' });
    }

    const clinic = new Clinic({
      name,
      address,
      phone,
      description,
      image: req.file ? `/uploads/${req.file.filename}` : null
    });

    await clinic.save();
    res.status(201).json(clinic);
  } catch (error) {
    res.status(500).json({ message: 'Eroare la adăugarea clinicii', error: error.message });
  }
});

// Rută pentru adăugarea unui doctor nou
router.post('/doctors', isAdmin, async (req, res) => {
  try {
    const { name, email, password, description, clinic } = req.body;

    if (!name || !email || !password || !clinic) {
      return res.status(400).json({ 
        message: 'Vă rugăm să completați toate câmpurile obligatorii (nume, email, parolă, clinică)' 
      });
    }

    // Verifică dacă email-ul există deja
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Există deja un utilizator cu acest email' });
    }

    // Verifică dacă clinica există
    const clinicExists = await Clinic.findById(clinic);
    if (!clinicExists) {
      return res.status(400).json({ message: 'Clinica selectată nu există' });
    }

    // Creează noul doctor ca utilizator cu rol de doctor
    const newDoctor = new User({
      name,
      email,
      password,
      role: 'doctor',
      description: description || null,
      clinic,
      isFirstLogin: true,
      profileSetupComplete: false
    });

    await newDoctor.save();

    // Returnează doctorul creat (fără parolă)
    const doctorToReturn = await User.findById(newDoctor._id)
      .select('-password')
      .populate('clinic', 'name address');

    res.status(201).json(doctorToReturn);
  } catch (error) {
    console.error('Eroare la adăugarea doctorului:', error);
    res.status(500).json({ message: 'Eroare la adăugarea doctorului', error: error.message });
  }
});

module.exports = router; 