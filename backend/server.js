const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Încarcă rutele
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const carouselRoutes = require('./routes/carousel');
const domainsRoutes = require('./routes/domains');
const clinicsRoutes = require('./routes/clinics');
const doctorRoutes = require('./routes/doctor'); 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rute
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/carousel', carouselRoutes);
app.use('/api/domains', domainsRoutes);
app.use('/api/clinics', clinicsRoutes);
app.use('/api/doctors', doctorRoutes); 

// Ruta de test
app.get('/', (req, res) => {
  res.send('Backend-ul funcționează!');
});

// Conectare la MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Conectat la MongoDB'))
  .catch((err) => console.error('Eroare la conectarea la MongoDB:', err));

// Pornire server
app.listen(PORT, () => {
  console.log(`Serverul rulează pe portul ${PORT}`);
});