const express = require('express');
const router = express.Router();
const {authMiddleware} = require('../middleware/auth');
const MedicalHistory = require('../models/MedicalHistory');
const Pacient = require('../models/Patient');

// Get medical history for current user (patient)
router.get('/me', authMiddleware , async (req, res) => {
    try {
        if (req.user.type !== 'Patient') {
            return res.status(403).json({ message: 'Access denied. Only patients can access their own medical history' });
        }

        const medicalHistory = await MedicalHistory.findOne({ patient: req.user.id })
            .populate('patient')
            .populate('medications.prescribedBy', 'name');

        if (!medicalHistory) {
            return res.status(404).json({ message: 'Medical history not found' });
        }

        res.json(medicalHistory);
    } catch (error) {
        console.error('Error fetching personal medical history:', error);
        res.status(500).json({ message: 'Error fetching medical history' });
    }
});

// Get medical history for a patient
router.get('/:patientId', async (req, res) => {
    try {

        console.log('Fetching medical history for patient:', req.params.patientId);
        const patient = await Pacient.findById(req.params.patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        const medicalHistory = await MedicalHistory.findOne({ patient: req.params.patientId })
            .populate('patient')
            .populate('medications.prescribedBy', 'name')
            .populate('notes.author', 'name');

        if (!medicalHistory) {
            return res.status(404).json({ message: 'Medical history not found' });
        }

        res.json(medicalHistory);
    } catch (error) {
        console.error('Error fetching medical history:', error);
        res.status(500).json({ message: 'Error fetching medical history' });
    }
});

// Adaugă o condiție medicală
router.post('/:patientId/conditions', authMiddleware,  async (req, res) => {
    try {
        const { name, diagnosedDate, status, notes } = req.body;
        const medicalHistory = await MedicalHistory.findOneAndUpdate(
            { patient: req.params.patientId },
            {
                $push: {
                    conditions: { name, diagnosedDate, status, notes }
                }
            },
            { new: true, upsert: true }
        );
        res.json(medicalHistory);
    } catch (error) {
        console.error('Error adding medical condition:', error);
        res.status(500).json({ message: 'Error adding medical condition' });
    }
});

// Adaugă o medicație
router.post('/:patientId/medications', authMiddleware,  async (req, res) => {
    try {
        const { name, dosage, frequency, startDate, endDate, notes } = req.body;
        const medicalHistory = await MedicalHistory.findOneAndUpdate(
            { patient: req.params.patientId },
            {
                $push: {
                    medications: { name, dosage, frequency, startDate, endDate, notes }
                }
            },
            { new: true, upsert: true }
        );
        res.json(medicalHistory);
    } catch (error) {
        console.error('Error adding medication:', error);
        res.status(500).json({ message: 'Error adding medication' });
    }
});

// Adaugă semne vitale
router.post('/:patientId/vitals', authMiddleware , async (req, res) => {
    try {
        const { type, value, date, notes } = req.body;
        const medicalHistory = await MedicalHistory.findOneAndUpdate(
            { patient: req.params.patientId },
            {
                $push: {
                    vitalSigns: { type, value, date, notes }
                }
            },
            { new: true, upsert: true }
        );
        res.json(medicalHistory);
    } catch (error) {
        console.error('Error adding vital signs:', error);
        res.status(500).json({ message: 'Error adding vital signs' });
    }
});

// Adaugă o notă
router.post('/:patientId/notes', authMiddleware ,  async (req, res) => {
    try {
        const { content, date } = req.body;
        const medicalHistory = await MedicalHistory.findOneAndUpdate(
            { patient: req.params.patientId },
            {
                $push: {
                    notes: { content, date }
                }
            },
            { new: true, upsert: true }
        );
        res.json(medicalHistory);
    } catch (error) {
        console.error('Error adding note:', error);
        res.status(500).json({ message: 'Error adding note' });
    }
});

// Actualizează informații despre stil de viață
router.put('/:patientId/lifestyle', authMiddleware, async (req, res) => {
    try {
        const { smoking, alcohol, exercise, diet } = req.body;
        const medicalHistory = await MedicalHistory.findOneAndUpdate(
            { patient: req.params.patientId },
            {
                $set: {
                    lifestyle: { smoking, alcohol, exercise, diet }
                }
            },
            { new: true, upsert: true }
        );
        res.json(medicalHistory);
    } catch (error) {
        console.error('Error updating lifestyle information:', error);
        res.status(500).json({ message: 'Error updating lifestyle information' });
    }
});

module.exports = router; 