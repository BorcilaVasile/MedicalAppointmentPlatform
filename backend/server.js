const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Încarcă rutele
const authRoutes = require('./src/routes/authRoutes');
const carouselRoutes = require('./src/routes/carousel');
const registerRoutes = require('./src/routes/registerRoutes');
const publicDoctorsRoutes = require('./src/routes/publicDoctorsRoutes');
const publicClinicRoutes = require('./src/routes/publicClinicRoutes');
const notificationsRoutes = require('./src/routes/notificationRoutes');
const privatePatientRoutes = require('./src/routes/privatePatientRoutes');
const privateDoctorRoutes = require('./src/routes/privateDoctorRoutes');
const specialtiesRoutes= require('./src/routes/specialitiesRoutes');
const publicReviewRoutes= require('./src/routes/publicReviewRoutes');
const publicAppointmentRoutes=require('./src/routes/publicAppointmentsRoutes');
const medicalHistoryRoutes = require('./src/routes/medicalHistoryRoutes');
const privateAppointmentRoutes = require('./src/routes/privateAppointmentRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://medical-appointment-platform.vercel.app',
    'https://medical-appointment-platform-git-main-vasileborcila.vercel.app',
    'https://medical-appointment-platform-vasileborcila.vercel.app',
    'https://medical-appointment-platform-git-main-tudorcrisan.vercel.app',
    'https://medical-appointment-platform-tudorcrisan.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle OPTIONS requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.sendStatus(204);
});

// Parse JSON bodies
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    // Set appropriate cache headers for images
    if (path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }
}));

// Rute
app.use('/api/auth', authRoutes);
app.use('/api/carousel', carouselRoutes);
app.use('/api/patients', registerRoutes);
app.use('/api/doctors', publicDoctorsRoutes);
app.use('/api/clinics', publicClinicRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/patient', privatePatientRoutes);
app.use('/api/doctor', privateDoctorRoutes);
app.use('/api/specialties', specialtiesRoutes);
app.use('/api/reviews', publicReviewRoutes);
app.use('/api/appointments',publicAppointmentRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/medical-history', medicalHistoryRoutes);
app.use('/api/doctor-appointments', privateAppointmentRoutes);


// Ruta de test
app.get('/', (req, res) => {
  res.send('Backend-ul funcționează!');
});

// Conectare la MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

// Pornire server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Uploads directory: ${uploadsDir}`);
});