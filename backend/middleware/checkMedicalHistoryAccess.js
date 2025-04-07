const jwt = require('jsonwebtoken');
const Appointment = require('../models/appointment');

const checkMedicalHistoryAccess = async (req, res, next) => {
  try {
    // Get the patient ID from the request parameters
    const patientId = req.params.patientId;
    
    // Get the user from the request (set by auth middleware)
    const user = req.user;

    // If user is the patient, they can access their own medical history
    if (user.role === 'patient' && user._id.toString() === patientId) {
      return next();
    }

    // If user is a doctor, check if they have any appointments with this patient
    if (user.role === 'doctor') {
      const hasAppointment = await Appointment.findOne({
        doctor: user._id,
        patient: patientId,
        status: { $in: ['confirmed', 'completed'] }
      });

      if (hasAppointment) {
        return next();
      }
    }

    // If none of the above conditions are met, deny access
    return res.status(403).json({
      message: 'You do not have permission to access this medical history'
    });
  } catch (error) {
    console.error('Error in checkMedicalHistoryAccess middleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = checkMedicalHistoryAccess; 