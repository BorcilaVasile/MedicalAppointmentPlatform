const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');
const { format, isSameDay } = require('date-fns');

// Middleware pentru verificarea rolului de doctor
const isDoctor = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token lipsă' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user || user.role !== 'doctor') {
      return res.status(403).json({ message: 'Acces interzis - Nu aveți drepturi de doctor' });
    }
    
    req.doctorId = decoded.id;
    next();
  } catch (error) {
    console.error('isDoctor middleware error:', error);
    res.status(401).json({ message: 'Token invalid' });
  }
};

// Rută pentru preluarea informațiilor doctorului autentificat
router.get('/me', isDoctor, async (req, res) => {
  try {
    const doctor = await User.findById(req.doctorId)
      .select('-password')
      .populate('clinic', 'name address');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctorul nu a fost găsit' });
    }

    res.json(doctor);
  } catch (error) {
    console.error('Eroare la preluarea informațiilor doctorului:', error);
    res.status(500).json({ message: 'Eroare la preluarea informațiilor doctorului' });
  }
});

// Rute protejate pentru doctori
router.get('/me/appointments', isDoctor, async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.doctorId })
      .populate('patient', 'name email phone')
      .populate('clinic', 'name address')
      .sort({ date: 1, time: 1 });

    if (!appointments) {
      return res.json([]);
    }

    // Format appointments for frontend
    const formattedAppointments = appointments.map(appointment => ({
      _id: appointment._id,
      patientName: appointment.patient?.name || 'Pacient necunoscut',
      patientEmail: appointment.patient?.email,
      patientPhone: appointment.patient?.phone,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      reason: appointment.reason,
      diagnosis: appointment.diagnosis,
      clinic: appointment.clinic,
      createdAt: appointment.createdAt
    }));

    res.json(formattedAppointments);
  } catch (error) {
    console.error('Eroare la preluarea programărilor:', error);
    res.status(500).json({ message: 'Eroare la preluarea programărilor', error: error.message });
  }
});

router.get('/me/referrals', isDoctor, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      doctor: req.doctorId,
      'referral.doctor': req.doctorId
    }).populate('patient', 'name email phone');

    const referrals = appointments.map(app => ({
      ...app.referral,
      patientName: app.patient.name,
      appointmentDate: app.date,
      appointmentId: app._id
    }));

    res.json(referrals);
  } catch (error) {
    res.status(500).json({ message: 'Eroare la preluarea trimiterilor', error: error.message });
  }
});

router.post('/appointments/:id/cancel', isDoctor, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: req.doctorId
    }).populate('patient', 'name email phone');

    if (!appointment) {
      return res.status(404).json({ message: 'Programarea nu a fost găsită' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    // Trimite notificare doar pacientului
    const patientNotification = new Notification({
      recipient: appointment.patient._id,
      sender: req.doctorId,
      type: 'APPOINTMENT_CANCELLED',
      appointment: appointment._id,
      message: `Programarea dumneavoastră pentru ${format(appointment.date, 'dd/MM/yyyy')} la ora ${appointment.time} a fost anulată de doctor.`
    });

    await patientNotification.save();

    res.json({ 
      message: 'Programarea a fost anulată cu succes', 
      appointment: {
        _id: appointment._id,
        patient: appointment.patient._id,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status
      }
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Eroare la anularea programării', error: error.message });
  }
});

router.post('/appointments/:id/diagnosis', isDoctor, async (req, res) => {
  try {
    const { diagnosis } = req.body;
    if (!diagnosis) {
      return res.status(400).json({ message: 'Diagnosticul este obligatoriu' });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: req.doctorId
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Programarea nu a fost găsită' });
    }

    appointment.diagnosis = diagnosis;
    await appointment.save();

    res.json({ message: 'Diagnosticul a fost adăugat cu succes', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Eroare la adăugarea diagnosticului', error: error.message });
  }
});

router.post('/appointments/:id/referral', isDoctor, async (req, res) => {
  try {
    const { specialty, reason, urgency } = req.body;
    if (!specialty || !reason) {
      return res.status(400).json({ message: 'Specialitatea și motivul sunt obligatorii' });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: req.doctorId
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Programarea nu a fost găsită' });
    }

    appointment.referral = {
      specialty,
      reason,
      urgency: urgency || 'normal',
      date: new Date(),
      doctor: req.doctorId
    };
    await appointment.save();

    res.json({ message: 'Trimiterea a fost adăugată cu succes', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Eroare la adăugarea trimiterii', error: error.message });
  }
});

// Rute publice
router.get('/', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('-password')
      .populate('clinic', 'name address')
      .sort({ createdAt: -1 });

    res.json(doctors);
  } catch (error) {
    console.error('Eroare la preluarea doctorilor:', error);
    res.status(500).json({ message: 'Eroare la preluarea doctorilor' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    console.log(`Fetching doctor with id: ${req.params.id}`);
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' })
      .select('-password')
      .populate('clinic', 'name address');

    if (!doctor) {
      console.log(`Doctor with id ${req.params.id} not found`);
      return res.status(404).json({ message: 'Doctorul nu a fost găsit' });
    }

    console.log('Doctor found:', {
      id: doctor._id,
      name: doctor.name,
      specialty: doctor.specialty,
      gender: doctor.gender,
      hasImage: !!doctor.profilePicture,
      clinic: doctor.clinic
    });

    res.json(doctor);
  } catch (error) {
    console.error('Eroare la preluarea doctorului:', error);
    res.status(500).json({ message: 'Eroare la preluarea doctorului' });
  }
});

// Rută pentru completarea profilului doctorului
router.put('/complete-profile', isDoctor, async (req, res) => {
  try {
    const doctor = await User.findById(req.doctorId);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctorul nu a fost găsit' });
    }

    const {
      specialty,
      experience,
      gender,
      clinic,
      phone,
      newPassword,
      description
    } = req.body;

    // Verifică dacă este prima autentificare și dacă parola nouă este furnizată
    if (doctor.isFirstLogin && !newPassword) {
      return res.status(400).json({ 
        message: 'Trebuie să setați o parolă nouă la prima autentificare' 
      });
    }

    // Actualizează informațiile profilului
    if (specialty) doctor.specialty = specialty;
    if (experience) doctor.experience = parseInt(experience);
    if (gender) doctor.gender = gender;
    if (clinic) doctor.clinic = clinic;
    if (phone) doctor.phone = phone;
    if (description) doctor.description = description;

    // Actualizează parola dacă este furnizată
    if (newPassword) {
      doctor.password = newPassword;
      doctor.isFirstLogin = false;
    }

    doctor.profileSetupComplete = true;
    await doctor.save();

    // Returnează doctorul actualizat (fără parolă)
    const updatedDoctor = await User.findById(doctor._id)
      .select('-password')
      .populate('clinic', 'name address');

    res.json(updatedDoctor);
  } catch (error) {
    console.error('Eroare la actualizarea profilului:', error);
    res.status(500).json({ 
      message: 'Eroare la actualizarea profilului', 
      error: error.message 
    });
  }
});

// Ruta pentru crearea unei programări
router.post('/:id/appointments', auth, async (req, res) => {
  try {
    const { date, time, reason } = req.body;
    const doctorId = req.params.id;
    const userId = req.user.id;

    console.log('Attempting to create appointment with:', {
      date,
      time,
      reason,
      doctorId,
      userId
    });

    // Verificări de bază
    if (!date || !time || !reason) {
      return res.status(400).json({ message: 'Data, ora și motivul sunt obligatorii' });
    }

    // Verifică dacă doctorul există
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' })
      .populate('clinic');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctorul nu a fost găsit' });
    }

    if (!doctor.clinic) {
      return res.status(400).json({ message: 'Doctorul nu este asociat cu nicio clinică' });
    }

    // Convertește data din string în obiect Date
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ message: 'Data programării este invalidă' });
    }

    console.log('Appointment date:', appointmentDate);

    // Verifică dacă data este în trecut
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDate < today) {
      return res.status(400).json({ message: 'Nu puteți face programări în trecut' });
    }

    // Verifică dacă există deja o programare la aceeași oră și dată
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    console.log('Checking for existing appointments between:', {
      startOfDay,
      endOfDay,
      time
    });

    // Verifică atât programările active cât și cele în așteptare
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      },
      time,
      status: { $in: ['confirmed', 'pending'] }
    });

    console.log('Existing appointment found:', existingAppointment);

    if (existingAppointment) {
      return res.status(400).json({ 
        message: 'Acest interval orar este deja rezervat',
        debug: {
          existingAppointment: {
            date: existingAppointment.date,
            time: existingAppointment.time,
            status: existingAppointment.status
          }
        }
      });
    }

    // Verifică dacă intervalul este marcat ca indisponibil
    const unavailableSlot = doctor.unavailableSlots?.find(slot => 
      slot && slot.date && isSameDay(new Date(slot.date), appointmentDate) && 
      (slot.isFullDay || (slot.slots && slot.slots.includes(time)))
    );

    console.log('Unavailable slot found:', unavailableSlot);

    if (unavailableSlot) {
      return res.status(400).json({ message: 'Acest interval orar nu este disponibil' });
    }

    // Creează programarea
    const appointment = new Appointment({
      doctor: doctorId,
      patient: userId,
      clinic: doctor.clinic._id,
      date: appointmentDate,
      time,
      reason,
      status: 'pending'
    });

    await appointment.save();

    // Trimite notificare doar doctorului
    const doctorNotification = new Notification({
      recipient: doctorId,
      sender: userId,
      type: 'APPOINTMENT_CREATED',
      appointment: appointment._id,
      message: `Aveți o nouă programare pentru ${format(appointmentDate, 'dd/MM/yyyy')} la ora ${time}.`
    });

    await doctorNotification.save();

    res.status(201).json({
      message: 'Programarea a fost creată cu succes',
      appointment
    });

  } catch (error) {
    console.error('Eroare la crearea programării:', error);
    res.status(500).json({ 
      message: 'Eroare la crearea programării', 
      error: error.message 
    });
  }
});

// Rută pentru adăugarea unui review
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const doctorId = req.params.id;
    const userId = req.user.id;

    // Verifică dacă doctorul există
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctorul nu a fost găsit' });
    }

    // Verifică dacă utilizatorul a mai lăsat un review pentru acest doctor
    const existingReview = doctor.reviews.find(
      review => review.userId.toString() === userId
    );

    if (existingReview) {
      return res.status(400).json({ message: 'Ați lăsat deja un review pentru acest doctor' });
    }

    // Adaugă review-ul
    doctor.reviews.push({
      userId,
      rating,
      comment
    });

    await doctor.save();

    // Returnează doctorul actualizat (fără parolă)
    const updatedDoctor = await User.findById(doctorId)
      .select('-password')
      .populate('clinic', 'name address');

    res.json(updatedDoctor);
  } catch (error) {
    console.error('Eroare la adăugarea review-ului:', error);
    res.status(500).json({ message: 'Eroare la adăugarea review-ului', error: error.message });
  }
});

// Rută pentru preluarea programărilor pe săptămână
router.get('/me/weekly-appointments', isDoctor, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const appointments = await Appointment.find({
      doctor: req.doctorId,
      date: {
        $gte: start,
        $lte: end
      }
    }).populate('patient', 'name email phone')
      .populate('clinic', 'name address')
      .sort({ date: 1, time: 1 });

    const doctor = await User.findById(req.doctorId);
    const unavailableSlots = doctor.unavailableSlots.filter(slot => 
      slot.date >= start && slot.date <= end
    );

    res.json({
      appointments,
      unavailableSlots
    });
  } catch (error) {
    console.error('Eroare la preluarea programărilor săptămânale:', error);
    res.status(500).json({ message: 'Eroare la preluarea programărilor săptămânale' });
  }
});

// Rută pentru marcarea intervalelor ca indisponibile
router.post('/me/unavailable', isDoctor, async (req, res) => {
  try {
    const { date, slots, isFullDay, reason } = req.body;

    const doctor = await User.findById(req.doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctorul nu a fost găsit' });
    }

    // Verifică dacă există programări în intervalele selectate
    if (!isFullDay && slots.length > 0) {
      const appointmentDate = new Date(date);
      const existingAppointments = await Appointment.find({
        doctor: req.doctorId,
        date: appointmentDate,
        time: { $in: slots },
        status: { $ne: 'cancelled' }
      });

      if (existingAppointments.length > 0) {
        return res.status(400).json({ 
          message: 'Există programări active în intervalele selectate' 
        });
      }
    }

    // Adaugă noul interval indisponibil
    doctor.unavailableSlots.push({
      date: new Date(date),
      slots,
      isFullDay,
      reason
    });

    await doctor.save();

    res.json({
      message: 'Intervalele au fost marcate ca indisponibile',
      unavailableSlots: doctor.unavailableSlots
    });
  } catch (error) {
    console.error('Eroare la marcarea intervalelor ca indisponibile:', error);
    res.status(500).json({ 
      message: 'Eroare la marcarea intervalelor ca indisponibile' 
    });
  }
});

// Rută pentru ștergerea unui interval indisponibil
router.delete('/me/unavailable/:slotId', isDoctor, async (req, res) => {
  try {
    const doctor = await User.findById(req.doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctorul nu a fost găsit' });
    }

    doctor.unavailableSlots = doctor.unavailableSlots.filter(
      slot => slot._id.toString() !== req.params.slotId
    );

    await doctor.save();

    res.json({
      message: 'Intervalul a fost șters cu succes',
      unavailableSlots: doctor.unavailableSlots
    });
  } catch (error) {
    console.error('Eroare la ștergerea intervalului:', error);
    res.status(500).json({ message: 'Eroare la ștergerea intervalului' });
  }
});

// Rută pentru preluarea sloturilor disponibile
router.get('/:id/appointments/slots', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    console.log('Fetching slots for:', {
      startDate,
      endDate,
      doctorId: req.params.id
    });

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Datele de început și sfârșit sunt obligatorii' });
    }

    // Găsește toate programările în intervalul specificat
    const appointments = await Appointment.find({
      doctor: req.params.id,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      status: { $ne: 'cancelled' } // Exclude programările anulate
    });

    console.log('Found appointments:', appointments.map(app => ({
      date: app.date,
      time: app.time,
      status: app.status
    })));

    // Organizează programările pe zile
    const bookedSlots = {};
    const userAppointments = {};

    appointments.forEach(appointment => {
      const dateStr = format(appointment.date, 'yyyy-MM-dd');
      
      // Inițializează array-urile dacă nu există
      if (!bookedSlots[dateStr]) {
        bookedSlots[dateStr] = [];
      }
      
      // Adaugă ora la sloturile rezervate
      bookedSlots[dateStr].push(appointment.time);

      // Dacă programarea aparține utilizatorului curent, o adăugăm la userAppointments
      if (appointment.patient.toString() === req.user.id) {
        if (!userAppointments[dateStr]) {
          userAppointments[dateStr] = [];
        }
        userAppointments[dateStr].push({
          id: appointment._id,
          time: appointment.time,
          status: appointment.status
        });
      }
    });

    console.log('Organized slots:', {
      bookedSlots,
      userAppointments
    });

    res.json({ bookedSlots, userAppointments });
  } catch (error) {
    console.error('Eroare la preluarea sloturilor:', error);
    res.status(500).json({ message: 'Eroare la preluarea sloturilor disponibile', error: error.message });
  }
});

// Get all doctors with pagination (public route)
router.get('/public', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('-password')
      .populate('clinic', 'name address')
      .sort({ createdAt: -1 });

    res.json(doctors);
  } catch (error) {
    console.error('Eroare la preluarea doctorilor:', error);
    res.status(500).json({ message: 'Eroare la preluarea doctorilor' });
  }
});

// Get all doctors with pagination (admin route)
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [doctors, total] = await Promise.all([
      User.find({ role: 'doctor' })
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('clinic', 'name'),
      User.countDocuments({ role: 'doctor' })
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

module.exports = router; 