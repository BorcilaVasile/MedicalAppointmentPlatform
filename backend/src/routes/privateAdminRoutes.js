const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { authMiddleware } = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const multer = require('multer');

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

module.exports = router; 