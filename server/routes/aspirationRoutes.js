const express = require('express');
const router = express.Router();
const Aspiration = require('../models/Aspiration');

// GET all aspirations
router.get('/', async (req, res) => {
    try {
        const aspirations = await Aspiration.find().sort({ createdAt: -1 });
        res.json(aspirations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch aspirations', details: error.message });
    }
});

// POST new aspiration
router.post('/', async (req, res) => {
    try {
        const { tag, text } = req.body;

        if (!text || text.trim() === '') {
            return res.status(400).json({ error: 'Aspiration text is required' });
        }

        const newAspiration = new Aspiration({
            tag: tag || 'Umum',
            text: text.trim()
        });

        const savedAspiration = await newAspiration.save();
        res.status(201).json(savedAspiration);
    } catch (error) {
        res.status(500).json({ error: 'Failed to post aspiration', details: error.message });
    }
});

module.exports = router;
