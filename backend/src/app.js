const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const auth = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', auth, notificationRoutes);

// ... existing code ...

module.exports = app; 