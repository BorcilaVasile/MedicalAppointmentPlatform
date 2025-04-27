const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Clinic = require('../models/Clinic');
const Appointment = require('../models/Appointment');
const { authMiddleware } = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const mongoose = require('mongoose');

// Get admin profile information
router.get('/', authMiddleware, async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id)
        .select('-password');
        
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        
        res.status(200).json(admin);
    }
    catch (error) {
        console.error('Error fetching admin info:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update admin profile information
router.put('/', authMiddleware, async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id);
        
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        
        // Update fields if provided
        if (req.body.firstName) admin.firstName = req.body.firstName;
        if (req.body.lastName) admin.lastName = req.body.lastName;
        if (req.body.email) admin.email = req.body.email;
        if (req.body.phone) admin.phone = req.body.phone;
        
        await admin.save();
        
        res.status(200).json(admin);
    } catch (error) {
        console.error('Error updating admin info:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Change admin password
router.put('/password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }
        
        const admin = await Admin.findById(req.user.id);
        
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        
        // Verify current password
        const isMatch = await admin.matchPassword(currentPassword);
        
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        
        // Update password
        admin.password = newPassword;
        await admin.save();
        
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing admin password:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get basic dashboard stats
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        // Case-insensitive check for admin role
        if (!req.user.type || req.user.type.toLowerCase() !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin role required.' });
        }

        const [usersCount, doctorsCount, clinicsCount, appointmentsCount] = await Promise.all([
            Patient.countDocuments(),
            Doctor.countDocuments(),
            Clinic.countDocuments(),
            Appointment.countDocuments()
        ]);

        res.json({
            users: usersCount,
            doctors: doctorsCount,
            clinics: clinicsCount,
            appointments: appointmentsCount
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
    }
});

// Get doctor statistics
router.get('/stats/doctors', authMiddleware, async (req, res) => {
    try {
        // Case-insensitive check for admin role
        if (!req.user.type || req.user.type.toLowerCase() !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin role required.' });
        }

        // Get doctor data from database
        const doctors = await Doctor.find({})
            .populate('specialty', 'name') // Populate specialty name
            .populate('clinic', 'name'); // Populate clinic name
        
        // Get all appointments
        const appointments = await Appointment.find({});
        
        // Get all reviews
        const reviews = await mongoose.model('Review').find({});
        
        // Calculate statistics for each doctor
        const doctorStats = await Promise.all(doctors.map(async (doctor) => {
            // Calculate total appointments for this doctor
            const doctorAppointments = appointments.filter(
                appointment => appointment.doctor.toString() === doctor._id.toString()
            );
            
            // Calculate completed appointments
            const completedAppointments = doctorAppointments.filter(
                appointment => appointment.status === 'completed'
            );
            
            // Calculate doctor's average rating
            const doctorReviews = reviews.filter(
                review => review.doctor.toString() === doctor._id.toString()
            );
            
            let averageRating = 0;
            if (doctorReviews.length > 0) {
                const totalRating = doctorReviews.reduce((sum, review) => sum + review.rating, 0);
                averageRating = (totalRating / doctorReviews.length).toFixed(1);
            }
            
            // Calculate completion rate
            const completionRate = doctorAppointments.length > 0 
                ? Math.round((completedAppointments.length / doctorAppointments.length) * 100) 
                : 0;
            
            return {
                _id: doctor._id,
                name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
                specialty: doctor.specialty.name || doctor.specialty,
                statistics: {
                    averageRating: parseFloat(averageRating),
                    totalAppointments: doctorAppointments.length,
                    completionRate: completionRate
                }
            };
        }));

        res.json(doctorStats);
    } catch (error) {
        console.error('Error fetching doctor stats:', error);
        // Returnăm date implicite pentru a preveni blocarea interfeței în caz de eroare
        res.status(200).json([
            {
                _id: '1',
                name: 'Dr. Exemplu Doctor',
                specialty: 'General',
                statistics: {
                    averageRating: 0,
                    totalAppointments: 0,
                    completionRate: 0
                }
            }
        ]);
    }
});

// Get activity statistics for the dashboard
router.get('/stats/activity', authMiddleware, async (req, res) => {
    try {
        // Case-insensitive check for admin role
        if (!req.user.type || req.user.type.toLowerCase() !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin role required.' });
        }

        // Încercăm toate operațiunile separat și gestionăm fiecare eroare individual
        let userStats = {};
        let appointmentStats = {};
        let topDoctors = [];

        try {
            // Get user stats
            const totalUsers = await Patient.countDocuments();
            const lastWeekDate = new Date();
            lastWeekDate.setDate(lastWeekDate.getDate() - 7);
            const lastMonthDate = new Date();
            lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
            
            const newUsersLastWeek = await Patient.countDocuments({ createdAt: { $gte: lastWeekDate } });
            const newUsersLastMonth = await Patient.countDocuments({ createdAt: { $gte: lastMonthDate } });
            const prevMonthUsersCount = totalUsers - newUsersLastMonth;
            
            // Calculate growth rate
            const growthRateLastMonth = prevMonthUsersCount > 0 
                ? Math.round((newUsersLastMonth / prevMonthUsersCount) * 100) 
                : 0;
            
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 3);

            const userGrowthData = [];
            const currentDate = new Date(startDate);
            
            while (currentDate <= new Date()) {
                const nextWeek = new Date(currentDate);
                nextWeek.setDate(nextWeek.getDate() + 7);
            
                // Numără utilizatorii creați în această săptămână
                const count = await Patient.countDocuments({
                  createdAt: {
                    $gte: currentDate,
                    $lt: nextWeek,
                  },
                });
            
                userGrowthData.push({
                  date: currentDate.toISOString().split('T')[0], // Formatează data ca YYYY-MM-DD
                  count,
                });
            
                // Trecem la următoarea săptămână
                currentDate.setDate(currentDate.getDate() + 7);
            }

            userStats = {
                newLastWeek: newUsersLastWeek,
                growthRateLastMonth,
                growthData: userGrowthData
            };
        } catch (userError) {
            console.error('Error fetching user stats:', userError);
            userStats = {
                newLastWeek: 0,
                growthRateLastMonth: 0,
                growthData: []
            };
        }
        
        try {
            // Get appointment stats
            const totalAppointments = await Appointment.countDocuments();
            const lastWeekDate = new Date();
            lastWeekDate.setDate(lastWeekDate.getDate() - 7);
            const lastMonthDate = new Date();
            lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
            
            const appointmentsLastWeek = await Appointment.countDocuments({ 
                createdAt: { $gte: lastWeekDate } 
            });
            const appointmentsLastMonth = await Appointment.countDocuments({ 
                createdAt: { $gte: lastMonthDate } 
            });
            
            // Get appointments by status
            const allStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

            const appointments = await Appointment.aggregate([
                { 
                $group: { 
                    _id: '$status', 
                    count: { $sum: 1 } 
                } 
                }
            ]);
            const countByStatus = appointments.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
            }, {});
            const appointmentsByStatus = allStatuses.map(status => ({
            status,
            count: countByStatus[status] || 0
            }));

            
            console.log(appointmentsByStatus);
            
            // Get appointments by specialty
            const appointmentsBySpecialty = await Appointment.aggregate([
                {
                    $lookup: {
                        from: 'doctors',
                        localField: 'doctor',
                        foreignField: '_id',
                        as: 'doctorInfo'
                    }
                },
                { $unwind: '$doctorInfo' },
                {
                    $lookup: {
                        from: 'specialities',
                        localField: 'doctorInfo.specialty',
                        foreignField: '_id',
                        as: 'specialtyInfo'
                    }
                },
                { $unwind: '$specialtyInfo' },
                { $group: { _id: '$specialtyInfo.name', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]);
            
            appointmentStats = {
                totalAppointments: totalAppointments,
                lastWeek: appointmentsLastWeek,
                lastMonth: appointmentsLastMonth,
                byStatus: appointmentsByStatus || [],
                bySpecialty: appointmentsBySpecialty || []
            };
        } catch (appointmentError) {
            console.error('Error fetching appointment stats:', appointmentError);
            appointmentStats = {
                lastWeek: 0,
                lastMonth: 0,
                byStatus: [],
                bySpecialty: []
            };
        }
        
        try {
            // Get top doctors with most appointments and best ratings
            topDoctors = await Doctor.aggregate([
                {
                    $lookup: {
                        from: 'appointments',
                        localField: '_id',
                        foreignField: 'doctor',
                        as: 'appointments'
                    }
                },
                {
                    $lookup: {
                        from: 'reviews',
                        localField: '_id',
                        foreignField: 'doctor',
                        as: 'reviews'
                    }
                },
                {
                    $lookup: {
                        from: 'specialities',
                        localField: 'specialty',
                        foreignField: '_id',
                        as: 'specialtyInfo'
                    }
                },
                { $unwind: { path: '$specialtyInfo', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: 1,
                        name: { $concat: ['Dr. ', '$firstName', ' ', '$lastName'] },
                        specialty: { $ifNull: ['$specialtyInfo.name', 'General'] },
                        appointmentCount: { $size: '$appointments' },
                        reviews: 1
                    }
                },
                {
                    $addFields: {
                        averageRating: {
                            $cond: {
                                if: { $eq: [{ $size: '$reviews' }, 0] },
                                then: 0,
                                else: { $avg: '$reviews.rating' }
                            }
                        }
                    }
                },
                { $sort: { appointmentCount: -1, averageRating: -1 } },
                { $limit: 6 },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        specialty: 1,
                        appointmentCount: 1,
                        averageRating: { $round: ['$averageRating', 1] }
                    }
                }
            ]);
        } catch (doctorsError) {
            console.error('Error fetching top doctors:', doctorsError);
            topDoctors = [];
        }

        const activityStats = {
            userStats,
            appointmentStats,
            topDoctors
        };

        res.json(activityStats);
    } catch (error) {
        console.error('Error fetching activity stats:', error);
        // Returnează un răspuns de eroare, dar includem date implicite pentru a preveni blocarea interfaței
        res.status(200).json({ 
            userStats: {
                newLastWeek: 0,
                growthRateLastMonth: 0,
                growthData: [
                    { date: '2023-11-01', count: 0 },
                    { date: '2023-11-08', count: 0 },
                    { date: '2023-11-15', count: 0 },
                    { date: '2023-11-22', count: 0 },
                    { date: '2023-11-29', count: 0 },
                    { date: '2023-12-06', count: 0 },
                    { date: '2023-12-13', count: 0 },
                    { date: '2023-12-20', count: 0 },
                    { date: '2023-12-27', count: 0 },
                    { date: '2024-01-03', count: 0 },
                    { date: '2024-01-10', count: 0 },
                    { date: '2024-01-17', count: 0 }
                ]
            },
            appointmentStats: {
                lastWeek: 0,
                lastMonth: 0,
                byStatus: [
                    { _id: 'pending', count: 0 },
                    { _id: 'confirmed', count: 0 },
                    { _id: 'completed', count: 0 },
                    { _id: 'cancelled', count: 0 }
                ],
                bySpecialty: [
                    { _id: 'Cardiologie', count: 0 },
                    { _id: 'Neurologie', count: 0 },
                    { _id: 'Dermatologie', count: 0 },
                    { _id: 'Pediatrie', count: 0 },
                    { _id: 'Oftalmologie', count: 0 }
                ]
            },
            topDoctors: [
                {
                    _id: '1',
                    name: 'Dr. Exemplu Doctor',
                    specialty: 'Cardiologie',
                    averageRating: 0,
                    appointmentCount: 0
                }
            ]
        });
    }
});

module.exports = router; 