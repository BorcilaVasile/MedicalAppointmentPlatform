const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// Get all notifications for the authenticated user
router.get('/', auth, notificationController.getUserNotifications);

// Mark a specific notification as read
router.put('/:id/read', auth, notificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', auth, notificationController.markAllAsRead);

module.exports = router; 