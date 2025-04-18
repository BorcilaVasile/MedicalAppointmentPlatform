const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

// Încarcă variabilele de mediu din .env
dotenv.config();

// Definim schema Patient direct în script (alternativ, o putem importa)
const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: null },
  phone: { type: String, default: null },
  address: { type: String, default: null },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: null },
  createdAt: { type: Date, default: Date.now },
});

// Middleware pentru hash-uirea parolei
patientSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Metodă pentru verificarea parolei
patientSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Patient = mongoose.model('Patient', patientSchema);

const populatePatients = async () => {
  try {
    // Conectare la MongoDB folosind MONGODB_URI din .env
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectat la MongoDB Atlas');

    // Verifică ce bază de date este folosită
    const dbName = mongoose.connection.db.databaseName;
    console.log(`Baza de date curentă: ${dbName}`);
    if (dbName !== 'medical_appointments') {
      throw new Error('Eroare: Scriptul nu folosește baza de date medical_appointments!');
    }

    // Șterge colecția patients existentă (opțional, pentru a porni de la zero)
    await Patient.deleteMany({});

    // Creează 10 pacienți
    const patients = [
      {
        name: 'Ion Popescu',
        email: 'ion.popescu@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '0712345678',
        address: 'Str. Mihai Viteazu 12, București',
        gender: 'Male',
      },
      {
        name: 'Maria Ionescu',
        email: 'maria.ionescu@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '0723456789',
        address: 'Str. Libertății 5, Cluj-Napoca',
        gender: 'Female',
      },
      {
        name: 'Andrei Vasilescu',
        email: 'andrei.vasilescu@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '0734567890',
        address: 'Str. Florilor 8, Timișoara',
        gender: 'Male',
      },
      {
        name: 'Elena Marin',
        email: 'elena.marin@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '0745678901',
        address: 'Str. Unirii 15, Iași',
        gender: 'Female',
      },
      {
        name: 'Alexandru Stan',
        email: 'alexandru.stan@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '0756789012',
        address: 'Str. Victoriei 20, Brașov',
        gender: 'Male',
      },
      {
        name: 'Ana Georgescu',
        email: 'ana.georgescu@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '0767890123',
        address: 'Str. Soarelui 3, Constanța',
        gender: 'Female',
      },
      {
        name: 'Mihai Radu',
        email: 'mihai.radu@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '0778901234',
        address: 'Str. Păcii 7, Sibiu',
        gender: 'Male',
      },
      {
        name: 'Ioana Dumitrescu',
        email: 'ioana.dumitrescu@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '0789012345',
        address: 'Str. Primăverii 10, Craiova',
        gender: 'Female',
      },
      {
        name: 'Vlad Munteanu',
        email: 'vlad.munteanu@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '0790123456',
        address: 'Str. Luceafărului 25, Oradea',
        gender: 'Male',
      },
      {
        name: 'Cristina Neagu',
        email: 'cristina.neagu@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '0701234567',
        address: 'Str. Independenței 30, Galați',
        gender: 'Female',
      },
    ];

    // Inserează toți pacienții
    await Patient.insertMany(patients);

    console.log('Baza de date medical_appointments a fost populată cu 10 pacienți!');
  } catch (error) {
    console.error('Eroare la populare:', error.message);
  } finally {
    // Închide conexiunea
    await mongoose.connection.close();
    console.log('Conexiune MongoDB închisă');
  }
};

populatePatients();