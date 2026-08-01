const express = require('express');
const router = express.Router();
const ChatbotMessage = require('../models/ChatbotMessage');
const { chatbotLimiter, readLimiter } = require('../middleware/rateLimiter');
const { validateChatbotMessage } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');

// GET all chatbot messages
// [SECURITY] requireAuth: Admin authentication required
// [SECURITY] readLimiter: 30 GETs per 15 min per IP (prevents scraping)
router.get('/', requireAuth, readLimiter, async (req, res) => {
    try {
        const messages = await ChatbotMessage.find().sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        console.error('[Chatbot GET]', error.message);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// POST new chatbot message
// [SECURITY] chatbotLimiter: 20 POSTs per 15 min per IP
// [SECURITY] validateChatbotMessage: validates sender enum, sanitizes text
router.post('/', chatbotLimiter, validateChatbotMessage, async (req, res) => {
    try {
        const { sender, text } = req.body; // Already sanitized by middleware

        const newMessage = new ChatbotMessage({ sender, text });
        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);
    } catch (error) {
        console.error('[Chatbot POST]', error.message);
        res.status(500).json({ error: 'Failed to post message' });
    }
});

module.exports = router;
