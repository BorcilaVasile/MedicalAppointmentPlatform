const mongoose = require('mongoose');

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
  familyHistory: [{
    condition: {
      type: String,
      required: true
    },
    relationship: String,
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
    exercise: {
      frequency: String,
      type: String
    },
    diet: {
      type: String,
      restrictions: [String]
    }
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
  }],
  documents: [{
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['Lab Result', 'Imaging', 'Prescription', 'Other'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    fileUrl: String,
    notes: String
  }],
  notes: [{
    date: {
      type: Date,
      default: Date.now
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['General', 'Treatment', 'Observation', 'Follow-up'],
      default: 'General'
    }
  }]
}, {
  timestamps: true
});

// Indexuri pentru performanță
medicalHistorySchema.index({ patient: 1 });
medicalHistorySchema.index({ 'conditions.name': 1 });
medicalHistorySchema.index({ 'medications.name': 1 });
medicalHistorySchema.index({ 'vitals.date': -1 });

module.exports = mongoose.model('MedicalHistory', medicalHistorySchema); 