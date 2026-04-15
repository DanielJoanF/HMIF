const express = require('express');
const router = express.Router();
const ForumMessage = require('../models/ForumMessage');
const Aspiration = require('../models/Aspiration');
const Documentation = require('../models/Documentation');
const ChatbotMessage = require('../models/ChatbotMessage');
const ActivityLog = require('../models/ActivityLog');
const fs = require('fs');
const path = require('path');

// Simple admin password - in production, use proper authentication
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Login endpoint
router.post('/login', (req, res) => {
    const { password } = req.body;

    if (password === ADMIN_PASSWORD) {
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid password' });
    }
});

// Get statistics
router.get('/stats', async (req, res) => {
    try {
        const [
            totalAspirations,
            totalForum,
            totalDocumentation,
            totalChatbot,
            aspirationsByTag,
            recentActivity
        ] = await Promise.all([
            Aspiration.countDocuments(),
            ForumMessage.countDocuments(),
            Documentation.countDocuments(),
            ChatbotMessage.countDocuments(),
            Aspiration.aggregate([
                { $group: { _id: '$tag', count: { $sum: 1 } } }
            ]),
            ActivityLog.find().sort({ timestamp: -1 }).limit(20)
        ]);

        res.json({
            counts: {
                aspirations: totalAspirations,
                forum: totalForum,
                documentation: totalDocumentation,
                chatbot: totalChatbot
            },
            aspirationsByTag,
            recentActivity
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics', details: error.message });
    }
});

// Get recent activity logs
router.get('/activity', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const activities = await ActivityLog.find()
            .sort({ timestamp: -1 })
            .limit(limit);

        res.json(activities);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch activities', details: error.message });
    }
});

// Delete aspiration
router.delete('/aspirations/:id', async (req, res) => {
    try {
        const aspiration = await Aspiration.findByIdAndDelete(req.params.id);

        if (!aspiration) {
            return res.status(404).json({ error: 'Aspiration not found' });
        }

        // Log activity
        await new ActivityLog({
            action: 'deleted',
            collection: 'aspirations',
            itemId: req.params.id,
            details: { tag: aspiration.tag, text: aspiration.text }
        }).save();

        res.json({ success: true, message: 'Aspiration deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete aspiration', details: error.message });
    }
});

// Delete documentation
router.delete('/documentation/:id', async (req, res) => {
    try {
        const doc = await Documentation.findByIdAndDelete(req.params.id);

        if (!doc) {
            return res.status(404).json({ error: 'Documentation not found' });
        }

        // Delete the actual file
        const filePath = path.join(__dirname, '..', '..', 'uploads', path.basename(doc.imageUrl));
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Log activity
        await new ActivityLog({
            action: 'deleted',
            collection: 'documentation',
            itemId: req.params.id,
            details: { title: doc.title }
        }).save();

        res.json({ success: true, message: 'Documentation deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete documentation', details: error.message });
    }
});

// Update documentation
router.put('/documentation/:id', async (req, res) => {
    try {
        const { title, caption } = req.body;

        const doc = await Documentation.findByIdAndUpdate(
            req.params.id,
            { title, caption },
            { new: true }
        );

        if (!doc) {
            return res.status(404).json({ error: 'Documentation not found' });
        }

        // Log activity
        await new ActivityLog({
            action: 'updated',
            collection: 'documentation',
            itemId: req.params.id,
            details: { title, caption }
        }).save();

        res.json(doc);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update documentation', details: error.message });
    }
});

// Delete forum message
router.delete('/forum/:id', async (req, res) => {
    try {
        const message = await ForumMessage.findByIdAndDelete(req.params.id);

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Log activity
        await new ActivityLog({
            action: 'deleted',
            collection: 'forum',
            itemId: req.params.id,
            details: { username: message.username, text: message.text }
        }).save();

        res.json({ success: true, message: 'Forum message deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete message', details: error.message });
    }
});

module.exports = router;
