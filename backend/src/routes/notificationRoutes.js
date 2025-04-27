const express = require('express');
const router = express.Router();
const {authMiddleware} = require('../middleware/auth');
const Notification = require('../models/Notification');

// Get all notifications for the authenticated patient
router.get('/', authMiddleware, async (req, res) => {
    try {
        console.log('Fetching notifications for user:', req.user.id);
        
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .populate('sender', 'firstName lastName')
            .populate('appointment');
            
        console.log('Found notifications:', notifications);
        
        if (!notifications || notifications.length === 0) {
            console.log('No notifications found for user:', req.user.id);
            return res.json([]);
        }
        
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all notifications for the authenticated doctor
router.get('/doctor', authMiddleware, async (req, res) => {
    try {
        console.log('Fetching notifications for doctor:', req.user.id);
        
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .populate('sender', 'name')
            .populate('appointment');
            
        console.log('Found notifications:', notifications);
        
        if (!notifications || notifications.length === 0) {
            console.log('No notifications found for user:', req.user.id);
            return res.json([]);
        }
        
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Get all notifications for the authenticated admin
router.get('/admin', authMiddleware, async (req, res) => {
    try {
        console.log('Fetching notifications for admin:', req.user.id);
        
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .populate('sender', 'name')
            .populate('appointment');
            
        console.log('Found notifications:', notifications);
        
        if (!notifications || notifications.length === 0) {
            console.log('No notifications found for admin:', req.user.id);
            return res.json([]);
        }
        
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Create a new notification
router.post('/', authMiddleware, async (req, res) => {
    try {
      const { recipient, recipientType, sender, senderType, type, appointment, message } = req.body;
  
      // Verificăm că cele obligatorii sunt trimise
      if (!recipient || !recipientType || !type || !message) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      const newNotification = new Notification({
        recipient,
        recipientType,
        sender,
        senderType,
        type,
        appointment,
        message,
      });
  
      await newNotification.save();
  
      res.status(201).json(newNotification);
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  
// Mark all notifications as read
router.put('/read-all', authMiddleware,  async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, read: false },
            { read: true }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete all notifications for the current user
router.delete('/delete-all', authMiddleware, async (req, res) => {
    try {
        await Notification.deleteMany({ recipient: req.user.id });
        res.json({ message: 'All notifications deleted successfully' });
    } catch (error) {
        console.error('Error deleting all notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark a notification as read
router.put('/:id/read', authMiddleware,   async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id },
            { read: true },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        res.json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a notification
router.delete('/:id', authMiddleware,  async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            recipient: req.user.id
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 