const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/clinics', require('./routes/clinics'));
app.use('/api/appointments', require('./routes/appointments'));
const notificationRoutes = require('./routes/notifications');
const medicalHistoryRoutes = require('./routes/medicalHistoryRoutes');
app.use('/api/notifications', notificationRoutes);
app.use('/api/medical-history', medicalHistoryRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`)); 