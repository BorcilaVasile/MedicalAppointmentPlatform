const Appointment = require('../models/Appointment');
const notificationController = require('./notificationController');

// Create a new appointment
exports.createAppointment = async (req, res) => {
  try {
    const appointment = new Appointment({
      ...req.body,
      patient: req.user._id
    });
    await appointment.save();

    // Send notification to the doctor
    await notificationController.createNotification(
      appointment.doctor,
      req.user._id,
      'APPOINTMENT_CREATED',
      appointment._id,
      `New appointment scheduled for ${new Date(appointment.date).toLocaleString()}`
    );

    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cancel an appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if the user is authorized to cancel this appointment
    if (appointment.patient.toString() !== req.user._id.toString() && 
        appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    // Send notification to the other party
    const recipientId = appointment.patient.toString() === req.user._id.toString() 
      ? appointment.doctor 
      : appointment.patient;

    await notificationController.createNotification(
      recipientId,
      req.user._id,
      'APPOINTMENT_CANCELLED',
      appointment._id,
      `Appointment for ${new Date(appointment.date).toLocaleString()} has been cancelled`
    );

    await appointment.remove();
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 