const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Încarcă variabilele de mediu din .env
dotenv.config();

// Definim schema Clinic direct în script (alternativ, o putem importa)
const clinicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Clinic = mongoose.model('Clinic', clinicSchema);

const populateClinics = async () => {
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

    // Șterge colecția clinics existentă (opțional, pentru a porni de la zero)
    await Clinic.deleteMany({});

    // Creează 5 clinici
    const clinics = [
      {
        name: 'Clinica MedLife București',
        address: 'Str. Calea Victoriei 123, București',
        phone: '0211234567',
        description: 'Clinică modernă specializată în consultații generale și analize medicale.',
        image: '/uploads/clinic_medlife_bucuresti.jpg',
      },
      {
        name: 'Clinica Sanador Cluj',
        address: 'Str. Memorandumului 45, Cluj-Napoca',
        phone: '0264123456',
        description: 'Servicii de cardiologie și pediatrie de înaltă calitate.',
        image: '/uploads/clinic_sanador_cluj.jpg',
      },
      {
        name: 'Clinica Polisano Timișoara',
        address: 'Str. Revoluției 89, Timișoara',
        phone: '0256123456',
        description: 'Specializată în chirurgie și recuperare medicală.',
        image: '/uploads/clinic_polisano_timisoara.jpg',
      },
      {
        name: 'Clinica Regina Maria Iași',
        address: 'Str. Palat 10, Iași',
        phone: '0232123456',
        description: 'Oferă consultații de specialitate și imagistică avansată.',
        image: '/uploads/clinic_regina_maria_iasi.jpg',
      },
      {
        name: 'Clinica Arcadia Constanța',
        address: 'Str. Delfinului 22, Constanța',
        phone: '0241123456',
        description: 'Centru medical cu focus pe stomatologie și ORL.',
        image: '/uploads/clinic_arcadia_constant.jpg',
      },
    ];

    // Inserează toate clinicile
    await Clinic.insertMany(clinics);

    console.log('Baza de date medical_appointments a fost populată cu 5 clinici!');
  } catch (error) {
    console.error('Eroare la populare:', error.message);
  } finally {
    // Închide conexiunea
    await mongoose.connection.close();
    console.log('Conexiune MongoDB închisă');
  }
};

populateClinics();