const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkMedicalHistoryAccess = require('../middleware/checkMedicalHistoryAccess');
const MedicalHistory = require('../models/MedicalHistory');

// Get medical history for a patient
router.get('/:patientId', auth, checkMedicalHistoryAccess, async (req, res) => {
    try {
        const medicalHistory = await MedicalHistory.findOne({ patient: req.params.patientId })
            .populate('patient', 'name email')
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
router.post('/:patientId/conditions', auth, checkMedicalHistoryAccess, async (req, res) => {
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
router.post('/:patientId/medications', auth, checkMedicalHistoryAccess, async (req, res) => {
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
router.post('/:patientId/vitals', auth, checkMedicalHistoryAccess, async (req, res) => {
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
router.post('/:patientId/notes', auth, checkMedicalHistoryAccess, async (req, res) => {
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
router.put('/:patientId/lifestyle', auth, checkMedicalHistoryAccess, async (req, res) => {
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