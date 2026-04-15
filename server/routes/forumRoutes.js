const express = require('express');
const router = express.Router();
const ForumMessage = require('../models/ForumMessage');

// GET all forum messages
router.get('/', async (req, res) => {
    try {
        const messages = await ForumMessage.find().sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
    }
});

// POST new forum message
router.post('/', async (req, res) => {
    try {
        const { username, text } = req.body;

        if (!text || text.trim() === '') {
            return res.status(400).json({ error: 'Message text is required' });
        }

        const newMessage = new ForumMessage({
            username: username || 'Anonymous',
            text: text.trim()
        });

        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);
    } catch (error) {
        res.status(500).json({ error: 'Failed to post message', details: error.message });
    }
});

module.exports = router;
