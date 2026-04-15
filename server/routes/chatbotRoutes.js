const express = require('express');
const router = express.Router();
const ChatbotMessage = require('../models/ChatbotMessage');

// GET all chatbot messages
router.get('/', async (req, res) => {
    try {
        const messages = await ChatbotMessage.find().sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
    }
});

// POST new chatbot message
router.post('/', async (req, res) => {
    try {
        const { sender, text } = req.body;

        if (!sender || !text || text.trim() === '') {
            return res.status(400).json({ error: 'Sender and text are required' });
        }

        if (!['user', 'bot'].includes(sender)) {
            return res.status(400).json({ error: 'Sender must be either "user" or "bot"' });
        }

        const newMessage = new ChatbotMessage({
            sender,
            text: text.trim()
        });

        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);
    } catch (error) {
        res.status(500).json({ error: 'Failed to post message', details: error.message });
    }
});

module.exports = router;
