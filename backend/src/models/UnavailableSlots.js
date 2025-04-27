const mongoose = require('mongoose');

const unavailableSlotSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  slots: [{
    type: String
  }],
  isFullDay: {
    type: Boolean,
    default: false
  },
  reason: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('UnavailableSlot', unavailableSlotSchema);