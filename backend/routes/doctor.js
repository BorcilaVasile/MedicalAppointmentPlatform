const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');
const { format } = require('date-fns');

// Configurare multer pentru stocarea imaginilor
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// GET: Preia toți doctorii
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET: Preia un doctor specific
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctorul nu a fost găsit' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Adaugă un doctor nou (cu suport pentru imagine)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { name, email, password, specialization, experience, description, gender } = req.body;

    // Validare
    if (!name || !email || !password || !specialization || !description) {
      return res.status(400).json({ 
        message: 'Toate câmpurile obligatorii trebuie completate (nume, email, parolă, specializare, descriere).' 
      });
    }

    // Verifică dacă există deja un doctor cu acest email
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Există deja un doctor cu acest email.' });
    }

    const newDoctor = new Doctor({
      name,
      email,
      password,
      specialty: specialization,
      experience: experience || 0,
      description,
      gender: gender || 'Nespecificat',
      image: req.file ? `/uploads/${req.file.filename}` : '',
    });

    const savedDoctor = await newDoctor.save();
    res.status(201).json(savedDoctor);
  } catch (error) {
    console.error('Eroare la salvarea doctorului:', error);
    res.status(500).json({ 
      message: 'Eroare la salvarea doctorului.', 
      error: error.message 
    });
  }
});

// PUT: Actualizează un doctor
router.put('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctorul nu a fost găsit' });

    doctor.name = req.body.name || doctor.name;
    doctor.specialty = req.body.specialty || doctor.specialty;
    doctor.description = req.body.description || doctor.description;
    doctor.image = req.body.image || doctor.image;
    doctor.reviews = req.body.reviews || doctor.reviews;

    const updatedDoctor = await doctor.save();
    res.json(updatedDoctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE: Șterge un doctor
router.delete('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctorul nu a fost găsit' });

    await doctor.remove();
    res.json({ message: 'Doctorul a fost șters' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Adaugă un review pentru un doctor
router.post('/:id/reviews', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctorul nu a fost găsit' });

    const review = {
      rating: req.body.rating,
      comment: req.body.comment,
      createdAt: new Date()
    };

    doctor.reviews.push(review);
    const updatedDoctor = await doctor.save();
    res.status(201).json(updatedDoctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Ruta pentru crearea unei programări
router.post('/:id/appointments', auth, async (req, res) => {
  try {
    const { date, time } = req.body;
    const doctorId = req.params.id;
    const userId = req.user.id;

    // Verifică dacă doctorul există
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctorul nu a fost găsit' });
    }

    // Verifică dacă există deja o programare la aceeași oră și dată
    const appointmentDate = new Date(date);
    const startOfDay = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      },
      time,
      status: { $ne: 'anulat' }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Acest interval orar este deja rezervat' });
    }

    // Creează programarea
    const appointment = new Appointment({
      doctorId,
      userId,
      date: appointmentDate,
      time
    });

    await appointment.save();

    res.status(201).json({
      message: 'Programarea a fost creată cu succes',
      appointment
    });

  } catch (error) {
    console.error('Eroare la crearea programării:', error);
    res.status(500).json({ message: 'Eroare la crearea programării' });
  }
});

// Ruta pentru a obține sloturile rezervate într-un interval de date
router.get('/:id/appointments/slots', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const doctorId = req.params.id;
    const userId = req.user.id;

    // Verifică dacă doctorul există
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctorul nu a fost găsit' });
    }

    // Găsește toate programările în intervalul specificat
    const appointments = await Appointment.find({
      doctorId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      status: { $ne: 'anulat' }
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
      if (appointment.userId.toString() === userId) {
        userAppointments[dateStr][appointment.time] = appointment._id.toString();
      }
    });

    console.log('User Appointments:', userAppointments); // Pentru debugging

    res.json({ bookedSlots, userAppointments });
  } catch (error) {
    console.error('Eroare la preluarea sloturilor rezervate:', error);
    res.status(500).json({ message: 'Eroare la preluarea sloturilor rezervate' });
  }
});

// Ruta pentru anularea unei programări
router.post('/:id/appointments/:appointmentId/cancel', auth, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;

    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Programarea nu a fost găsită' });
    }

    // Verifică dacă programarea aparține utilizatorului
    if (appointment.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Nu aveți permisiunea de a anula această programare' });
    }

    // Verifică dacă programarea este cu cel puțin o oră înainte
    const appointmentDateTime = new Date(appointment.date);
    appointmentDateTime.setHours(...appointment.time.split(':'));
    const now = new Date();
    const hoursDifference = (appointmentDateTime - now) / (1000 * 60 * 60);

    if (hoursDifference < 1) {
      return res.status(400).json({ 
        message: 'Programările pot fi anulate doar cu cel puțin o oră înainte' 
      });
    }

    appointment.status = 'anulat';
    await appointment.save();

    res.json({ 
      message: 'Programarea a fost anulată cu succes',
      appointment 
    });

  } catch (error) {
    console.error('Eroare la anularea programării:', error);
    res.status(500).json({ message: 'Eroare la anularea programării' });
  }
});

module.exports = router;