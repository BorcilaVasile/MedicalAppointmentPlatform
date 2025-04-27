const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'recipientType', 
    required: true,
  },
  recipientType: {
    type: String,
    enum: ['Patient', 'Doctor'], 
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderType', 
    required: false, 
  },
  senderType: {
    type: String,
    enum: ['Patient', 'Doctor'],
    required: function () {
      return !!this.sender; 
    },
  },
  type: {
    type: String,
    enum: ['APPOINTMENT_CREATED', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_UPDATED', 'MEDICAL_HISTORY_UPDATE'],
    required: true,
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexuri pentru performanță
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);