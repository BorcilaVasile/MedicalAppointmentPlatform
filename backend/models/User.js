const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'doctor'],
    default: 'user'
  },
  profilePicture: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    default: null
  },
  address: {
    type: String,
    default: null
  },
  // Câmpuri specifice pentru doctori
  specialty: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: null
  },
  education: {
    type: String,
    default: null
  },
  experience: {
    type: Number,
    default: null
  },
  gender: {
    type: String,
    enum: ['Masculin', 'Feminin', 'Altul'],
    default: null
  },
  clinic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    default: null
  },
  reviews: [reviewSchema],
  schedule: {
    type: Map,
    of: {
      start: String,
      end: String,
      breakStart: String,
      breakEnd: String
    },
    default: new Map()
  },
  // Adăugăm câmpul pentru intervale indisponibile
  unavailableSlots: [{
    date: {
      type: Date,
      required: true
    },
    slots: [{
      type: String,  // Format: "HH:mm"
      required: true
    }],
    isFullDay: {
      type: Boolean,
      default: false
    },
    reason: {
      type: String,
      default: 'Indisponibil'
    }
  }],
  isFirstLogin: {
    type: Boolean,
    default: false
  },
  profileSetupComplete: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pentru hash-uirea parolei înainte de salvare
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Metodă pentru verificarea parolei
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);