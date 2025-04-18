const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

// Încarcă variabilele de mediu din .env
dotenv.config();

// Definim schema Doctor direct în script (alternativ, o putem importa)
const doctorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  specialty: { type: mongoose.Schema.Types.ObjectId, ref: 'Speciality', required: true },
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  experience: { type: Number, default: 0 },
  description: { type: String, required: true },
  image: { type: String, required: true, default: 'uploads/default.png' },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  phone: { type: String, required: true, unique: true },
  schedule: {
    monday: { start: String, end: String },
    tuesday: { start: String, end: String },
    wednesday: { start: String, end: String },
    thursday: { start: String, end: String },
    friday: { start: String, end: String },
    saturday: { start: String, end: String },
    sunday: { start: String, end: String },
  },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }], // Definim reviews ca array gol
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Hash password before saving
doctorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Metodă pentru verificarea parolei
doctorSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Doctor = mongoose.model('Doctor', doctorSchema);
const Speciality = mongoose.model('Speciality', mongoose.Schema({
  name: { type: String, required: true },
  requirements: { type: [String], required: true },
  description: { type: String, required: true },
}));
const Clinic = mongoose.model('Clinic', mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true }));

const populateDoctors = async () => {
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

    // Găsește toate specializările existente (ar trebui să fie 8 din scriptul anterior)
    const specialities = await Speciality.find();
    if (specialities.length < 8) {
      throw new Error('Eroare: Nu există suficiente specializări în baza de date! Rulează populateSpecialities.js mai întâi.');
    }

    // Găsește toate clinicile existente (ar trebui să fie 5 din scriptul anterior)
    const clinics = await Clinic.find();
    if (clinics.length < 5) {
      throw new Error('Eroare: Nu există suficiente clinici în baza de date! Rulează populateClinics.js mai întâi.');
    }

    // Șterge colecția doctors existentă (opțional, pentru a porni de la zero)
    await Doctor.deleteMany({});

    // Creează 10 medici
    const doctors = [
      {
        firstName: 'Andrei',
        lastName: 'Popa',
        email: 'andrei.popa@example.com',
        password: await bcrypt.hash('password123', 10),
        specialty: specialities[0]._id, // Cardiologie
        clinic: clinics[0]._id, // Clinica MedLife București
        experience: 10,
        description: 'Cardiolog cu experiență vastă în tratarea afecțiunilor cardiovasculare.',
        image: 'uploads/doctor_andrei_popa.jpg',
        gender: 'Male',
        phone: '0712345670',
        schedule: {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' },
          saturday: { start: '', end: '' },
          sunday: { start: '', end: '' },
        },
      },
      {
        firstName: 'Elena',
        lastName: 'Marin',
        email: 'elena.marin@example.com',
        password: await bcrypt.hash('password123', 10),
        specialty: specialities[1]._id, // Dermatologie
        clinic: clinics[0]._id, // Clinica MedLife București
        experience: 8,
        description: 'Dermatolog specializat în afecțiuni ale pielii și tratamente estetice.',
        image: 'uploads/doctor_elena_marin.jpg',
        gender: 'Female',
        phone: '0712345671',
        schedule: {
          monday: { start: '10:00', end: '18:00' },
          tuesday: { start: '10:00', end: '18:00' },
          wednesday: { start: '10:00', end: '18:00' },
          thursday: { start: '10:00', end: '18:00' },
          friday: { start: '10:00', end: '18:00' },
          saturday: { start: '', end: '' },
          sunday: { start: '', end: '' },
        },
      },
      {
        firstName: 'Mihai',
        lastName: 'Ionescu',
        email: 'mihai.ionescu@example.com',
        password: await bcrypt.hash('password123', 10),
        specialty: specialities[2]._id, // Pediatrie
        clinic: clinics[1]._id, // Clinica Sanador Cluj
        experience: 12,
        description: 'Pediatru dedicat sănătății copiilor, cu peste 10 ani de experiență.',
        image: 'uploads/doctor_mihai_ionescu.jpg',
        gender: 'Male',
        phone: '0712345672',
        schedule: {
          monday: { start: '08:00', end: '16:00' },
          tuesday: { start: '08:00', end: '16:00' },
          wednesday: { start: '08:00', end: '16:00' },
          thursday: { start: '08:00', end: '16:00' },
          friday: { start: '08:00', end: '16:00' },
          saturday: { start: '09:00', end: '13:00' },
          sunday: { start: '', end: '' },
        },
      },
      {
        firstName: 'Ana',
        lastName: 'Georgescu',
        email: 'ana.georgescu@example.com',
        password: await bcrypt.hash('password123', 10),
        specialty: specialities[3]._id, // Ortopedie
        clinic: clinics[1]._id, // Clinica Sanador Cluj
        experience: 7,
        description: 'Ortoped specializat în chirurgie spinală și traumatologie.',
        image: 'uploads/doctor_ana_georgescu.jpg',
        gender: 'Female',
        phone: '0712345673',
        schedule: {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' },
          saturday: { start: '', end: '' },
          sunday: { start: '', end: '' },
        },
      },
      {
        firstName: 'Vlad',
        lastName: 'Popescu',
        email: 'vlad.popescu@example.com',
        password: await bcrypt.hash('password123', 10),
        specialty: specialities[4]._id, // Neurologie
        clinic: clinics[2]._id, // Clinica Polisano Timișoara
        experience: 9,
        description: 'Neurolog cu experiență în tratamentul accidentelor vasculare cerebrale.',
        image: 'uploads/doctor_vlad_popescu.jpg',
        gender: 'Male',
        phone: '0712345674',
        schedule: {
          monday: { start: '10:00', end: '18:00' },
          tuesday: { start: '10:00', end: '18:00' },
          wednesday: { start: '10:00', end: '18:00' },
          thursday: { start: '10:00', end: '18:00' },
          friday: { start: '10:00', end: '18:00' },
          saturday: { start: '09:00', end: '13:00' },
          sunday: { start: '', end: '' },
        },
      },
      {
        firstName: 'Ioana',
        lastName: 'Dumitrescu',
        email: 'ioana.dumitrescu@example.com',
        password: await bcrypt.hash('password123', 10),
        specialty: specialities[5]._id, // Ginecologie
        clinic: clinics[2]._id, // Clinica Polisano Timișoara
        experience: 6,
        description: 'Ginecolog specializat în sănătatea reproductivă feminină.',
        image: 'uploads/doctor_ioana_dumitrescu.jpg',
        gender: 'Female',
        phone: '0712345675',
        schedule: {
          monday: { start: '08:00', end: '16:00' },
          tuesday: { start: '08:00', end: '16:00' },
          wednesday: { start: '08:00', end: '16:00' },
          thursday: { start: '08:00', end: '16:00' },
          friday: { start: '08:00', end: '16:00' },
          saturday: { start: '', end: '' },
          sunday: { start: '', end: '' },
        },
      },
      {
        firstName: 'Radu',
        lastName: 'Stan',
        email: 'radu.stan@example.com',
        password: await bcrypt.hash('password123', 10),
        specialty: specialities[6]._id, // Endocrinologie
        clinic: clinics[3]._id, // Clinica Regina Maria Iași
        experience: 11,
        description: 'Endocrinolog cu focus pe diabet și afecțiuni tiroidiene.',
        image: 'uploads/doctor_radu_stan.jpg',
        gender: 'Male',
        phone: '0712345676',
        schedule: {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' },
          saturday: { start: '09:00', end: '13:00' },
          sunday: { start: '', end: '' },
        },
      },
      {
        firstName: 'Cristina',
        lastName: 'Neagu',
        email: 'cristina.neagu@example.com',
        password: await bcrypt.hash('password123', 10),
        specialty: specialities[7]._id, // Stomatologie
        clinic: clinics[3]._id, // Clinica Regina Maria Iași
        experience: 5,
        description: 'Stomatolog specializat în implantologie și estetică dentară.',
        image: 'uploads/doctor_cristina_neagu.jpg',
        gender: 'Female',
        phone: '0712345677',
        schedule: {
          monday: { start: '10:00', end: '18:00' },
          tuesday: { start: '10:00', end: '18:00' },
          wednesday: { start: '10:00', end: '18:00' },
          thursday: { start: '10:00', end: '18:00' },
          friday: { start: '10:00', end: '18:00' },
          saturday: { start: '', end: '' },
          sunday: { start: '', end: '' },
        },
      },
      {
        firstName: 'Alexandru',
        lastName: 'Munteanu',
        email: 'alexandru.munteanu@example.com',
        password: await bcrypt.hash('password123', 10),
        specialty: specialities[0]._id, // Cardiologie
        clinic: clinics[4]._id, // Clinica Arcadia Constanța
        experience: 15,
        description: 'Cardiolog renumit, cu peste 15 ani de experiență.',
        image: 'uploads/doctor_alexandru_munteanu.jpg',
        gender: 'Male',
        phone: '0712345678',
        schedule: {
          monday: { start: '08:00', end: '16:00' },
          tuesday: { start: '08:00', end: '16:00' },
          wednesday: { start: '08:00', end: '16:00' },
          thursday: { start: '08:00', end: '16:00' },
          friday: { start: '08:00', end: '16:00' },
          saturday: { start: '09:00', end: '13:00' },
          sunday: { start: '', end: '' },
        },
      },
      {
        firstName: 'Maria',
        lastName: 'Radu',
        email: 'maria.radu@example.com',
        password: await bcrypt.hash('password123', 10),
        specialty: specialities[5]._id, // Ginecologie
        clinic: clinics[4]._id, // Clinica Arcadia Constanța
        experience: 8,
        description: 'Ginecolog cu experiență în obstetrică și ecografie.',
        image: 'uploads/doctor_maria_radu.jpg',
        gender: 'Female',
        phone: '0712345679',
        schedule: {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' },
          saturday: { start: '', end: '' },
          sunday: { start: '', end: '' },
        },
      },
    ];

    // Inserează toți medicii
    await Doctor.insertMany(doctors);

    console.log('Baza de date medical_appointments a fost populată cu 10 medici!');
  } catch (error) {
    console.error('Eroare la populare:', error.message);
  } finally {
    // Închide conexiunea
    await mongoose.connection.close();
    console.log('Conexiune MongoDB închisă');
  }
};

populateDoctors();