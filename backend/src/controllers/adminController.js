const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Clinic = require('../models/Clinic');
const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');
const { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, subWeeks, format, parse } = require('date-fns');

// Get basic dashboard stats
exports.getStats = async (req, res) => {
  try {
    const [users, doctors, clinics, appointments] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Clinic.countDocuments(),
      Appointment.countDocuments()
    ]);
    
    res.status(200).json({
      users,
      doctors,
      clinics,
      appointments
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get doctor statistics
exports.getDoctorStats = async (req, res) => {
  try {
    const doctors = await Doctor.find().select('firstName lastName specialty');
    
    // For each doctor, calculate statistics (this would be more complex in a real app)
    const doctorsWithStats = doctors.map(doctor => ({
      id: doctor._id,
      name: `${doctor.firstName} ${doctor.lastName}`,
      specialty: doctor.specialty,
      statistics: {
        totalAppointments: Math.floor(Math.random() * 120) + 30, // Random data for demo
        averageRating: (Math.random() * 2 + 3).toFixed(1), // Random between 3.0 and 5.0
        completionRate: Math.floor(Math.random() * 20) + 80, // Random between 80% and 99%
      }
    }));
    
    res.status(200).json(doctorsWithStats);
  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get activity statistics
exports.getActivityStats = async (req, res) => {
  try {
    const now = new Date();
    const lastWeekStart = startOfWeek(subWeeks(now, 1));
    const lastWeekEnd = endOfWeek(subWeeks(now, 1));
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));
    
    // User statistics
    const totalUsers = await Patient.countDocuments();
    const newLastWeek = await Patient.countDocuments({
      createdAt: { $gte: lastWeekStart, $lte: lastWeekEnd }
    });
    
    const lastMonth = await Patient.countDocuments({
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
    });
    
    const twoMonthsAgo = await Patient.countDocuments({
      createdAt: { 
        $gte: startOfMonth(subMonths(now, 2)), 
        $lte: endOfMonth(subMonths(now, 2)) 
      }
    });
    
    // Calculate growth rate
    const growthRateLastMonth = twoMonthsAgo > 0 
      ? Math.round((lastMonth - twoMonthsAgo) / twoMonthsAgo * 100) 
      : 100;
    
    // Appointment statistics
    const appointmentsLastWeek = await Appointment.countDocuments({
      date: { $gte: lastWeekStart, $lte: lastWeekEnd }
    });
    
    const appointmentsLastMonth = await Appointment.countDocuments({
      date: { $gte: lastMonthStart, $lte: lastMonthEnd }
    });
    
    // Get appointments by status
    const byStatus = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get appointments by specialty through doctor specialty
    const bySpecialty = await Appointment.aggregate([
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctor',
          foreignField: '_id',
          as: 'doctorData'
        }
      },
      { $unwind: '$doctorData' },
      { $group: { _id: '$doctorData.specialty', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Top doctors by appointments
    const topDoctors = await Appointment.aggregate([
      { $group: { _id: '$doctor', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: 'doctors',
          localField: '_id',
          foreignField: '_id',
          as: 'doctorData'
        }
      },
      { $unwind: '$doctorData' },
      {
        $project: {
          _id: '$doctorData._id',
          name: { $concat: ['$doctorData.firstName', ' ', '$doctorData.lastName'] },
          specialty: '$doctorData.specialty',
          appointmentCount: '$count',
          averageRating: { $literal: 4.5 }, // Placeholder for demo
        }
      }
    ]);
    
    // Generate dummy growth data for charting
    const generateGrowthData = () => {
      const data = [];
      const startDate = new Date('2023-11-01');
      
      let userCount = 120; // Starting count
      
      for (let i = 0; i < 12; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i * 7); // Weekly data
        
        // Add some randomness to the growth
        userCount += Math.floor(Math.random() * 15) + 5;
        
        data.push({
          date: format(currentDate, 'yyyy-MM-dd'),
          count: userCount
        });
      }
      
      return data;
    };
    
    res.status(200).json({
      userStats: {
        newLastWeek,
        lastMonth,
        growthRateLastMonth,
        growthData: generateGrowthData()
      },
      appointmentStats: {
        lastWeek: appointmentsLastWeek,
        lastMonth: appointmentsLastMonth,
        byStatus,
        bySpecialty
      },
      topDoctors
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 