const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

// Încarcă variabilele de mediu din .env
dotenv.config();

// Definim schema MedicalHistory direct în script
const medicalHistorySchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  conditions: [{
    name: {
      type: String,
      required: true
    },
    diagnosedDate: Date,
    status: {
      type: String,
      enum: ['Active', 'Managed', 'Resolved'],
      default: 'Active'
    },
    notes: String
  }],
  allergies: [{
    allergen: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ['Mild', 'Moderate', 'Severe'],
      required: true
    },
    reaction: String
  }],
  medications: [{
    name: {
      type: String,
      required: true
    },
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    status: {
      type: String,
      enum: ['Active', 'Discontinued', 'Completed'],
      default: 'Active'
    }
  }],
  surgeries: [{
    procedure: {
      type: String,
      required: true
    },
    date: Date,
    hospital: String,
    surgeon: String,
    notes: String
  }],
  lifestyle: {
    smoking: {
      status: {
        type: String,
        enum: ['Never', 'Former', 'Current'],
        default: 'Never'
      },
      frequency: String,
      quitDate: Date
    },
    alcohol: {
      status: {
        type: String,
        enum: ['Never', 'Occasional', 'Regular'],
        default: 'Never'
      },
      frequency: String
    },
    exercise: String,
    diet: String
  },
  vitals: [{
    date: {
      type: Date,
      default: Date.now
    },
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number,
    notes: String
  }]
}, {
  timestamps: true
});

const MedicalHistory = mongoose.model('MedicalHistory', medicalHistorySchema);
const Patient = mongoose.model('Patient', new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }
}));

const populateMedicalHistory = async () => {
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

    // Șterge colecția medical_histories existentă (opțional, pentru a porni de la zero)
    await MedicalHistory.deleteMany({});

    // Găsim toți pacienții pentru a obține ID-urile lor
    const patients = await Patient.find();
    if (patients.length === 0) {
      throw new Error('Nu există pacienți în baza de date!');
    }
    console.log(`S-au găsit ${patients.length} pacienți.`);

    // Array pentru istoriile medicale generate
    const medicalHistories = [];

    // Pentru fiecare pacient, creăm 2 istorii medicale
    for (const patient of patients) {
      // Prima istorie medicală - mai completă
      const medicalHistory1 = {
        patient: patient._id,
        conditions: [
          {
            name: 'Hipertensiune arterială',
            diagnosedDate: new Date(2019, 5, 15),
            status: 'Active',
            notes: 'Pacientul a prezentat simptome de intensitate moderată.'
          },
          {
            name: 'Diabet zaharat tip 2',
            diagnosedDate: new Date(2020, 2, 10),
            status: 'Managed',
            notes: 'Sub control medicamentos.'
          }
        ],
        allergies: [
          {
            allergen: 'Peniciline',
            severity: 'Severe',
            reaction: 'Reacție cutanată severă, dificultăți de respirație.'
          }
        ],
        medications: [
          {
            name: 'Metformin',
            dosage: '850 mg',
            frequency: 'de două ori pe zi',
            startDate: new Date(2020, 2, 15),
            endDate: null,
            status: 'Active'
          },
          {
            name: 'Ramipril',
            dosage: '10 mg',
            frequency: 'zilnic',
            startDate: new Date(2019, 5, 20),
            endDate: null,
            status: 'Active'
          }
        ],
        surgeries: [
          {
            procedure: 'Apendicectomie',
            date: new Date(2015, 8, 3),
            hospital: 'Spitalul Universitar de Urgență București',
            surgeon: 'Dr. Ionescu',
            notes: 'Intervenție reușită fără complicații.'
          }
        ],
        lifestyle: {
          smoking: {
            status: 'Former',
            frequency: '15 țigări/zi',
            quitDate: new Date(2019, 1, 10)
          },
          alcohol: {
            status: 'Occasional',
            frequency: 'doar în weekend'
          },
          exercise: '2-3 ori/săptămână',
          diet: 'mediteraneană'
        },
        vitals: [
          {
            date: new Date(2023, 2, 15),
            bloodPressure: {
              systolic: 135,
              diastolic: 85
            },
            heartRate: 72,
            temperature: 36.6,
            weight: 78,
            height: 175,
            notes: 'În limitele normale.'
          },
          {
            date: new Date(2022, 8, 20),
            bloodPressure: {
              systolic: 145,
              diastolic: 90
            },
            heartRate: 80,
            temperature: 36.8,
            weight: 82,
            height: 175,
            notes: 'Tensiune ușor crescută.'
          }
        ]
      };

      // A doua istorie medicală - mai simplificată
      const medicalHistory2 = {
        patient: patient._id,
        conditions: [
          {
            name: 'Astm bronșic',
            diagnosedDate: new Date(2021, 4, 3),
            status: 'Managed',
            notes: null
          }
        ],
        allergies: [
          {
            allergen: 'Polen',
            severity: 'Moderate',
            reaction: 'Rinoree, strănut, tuse.'
          }
        ],
        medications: [
          {
            name: 'Salbutamol',
            dosage: '100 mcg',
            frequency: 'la nevoie',
            startDate: new Date(2021, 4, 10),
            endDate: null,
            status: 'Active'
          }
        ],
        lifestyle: {
          smoking: {
            status: 'Never',
            frequency: null,
            quitDate: null
          },
          alcohol: {
            status: 'Occasional',
            frequency: null
          },
          exercise: 'ocazional',
          diet: 'echilibrată'
        },
        vitals: [
          {
            date: new Date(2023, 3, 5),
            bloodPressure: {
              systolic: 120,
              diastolic: 75
            },
            heartRate: 68,
            temperature: 36.6,
            weight: 75,
            height: 175,
            notes: null
          }
        ]
      };

      // Adăugăm istoriile medicale în array
      medicalHistories.push(medicalHistory1);
      medicalHistories.push(medicalHistory2);
    }

    // Inserează toate istoriile medicale
    await MedicalHistory.insertMany(medicalHistories);

    console.log(`Baza de date medical_appointments a fost populată cu ${medicalHistories.length} istorii medicale pentru ${patients.length} pacienți!`);
  } catch (error) {
    console.error('Eroare la populare:', error.message);
  } finally {
    // Închide conexiunea
    await mongoose.connection.close();
    console.log('Conexiune MongoDB închisă');
  }
};

populateMedicalHistory(); 