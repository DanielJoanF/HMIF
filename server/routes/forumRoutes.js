const express = require('express');
const router = express.Router();
const ForumMessage = require('../models/ForumMessage');
const { forumLimiter } = require('../middleware/rateLimiter');
const { validateForumMessage } = require('../middleware/validate');

// GET all forum messages
router.get('/', async (req, res) => {
    try {
        const messages = await ForumMessage.find().sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        console.error('[Forum GET]', error.message);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// POST new forum message
// [SECURITY] forumLimiter: 10 POSTs per 15 min per IP
// [SECURITY] validateForumMessage: sanitizes username + text, enforces max length
router.post('/', forumLimiter, validateForumMessage, async (req, res) => {
    try {
        const { username, text } = req.body; // Already sanitized by middleware

        const newMessage = new ForumMessage({ username, text });
        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);
    } catch (error) {
        console.error('[Forum POST]', error.message);
        res.status(500).json({ error: 'Failed to post message' });
    }
});

module.exports = router;
