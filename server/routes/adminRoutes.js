const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const ForumMessage = require('../models/ForumMessage');
const Aspiration = require('../models/Aspiration');
const Documentation = require('../models/Documentation');
const ChatbotMessage = require('../models/ChatbotMessage');
const ActivityLog = require('../models/ActivityLog');
const { generateToken, requireAuth } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// ─── Login endpoint ─────────────────────────────────────────────────────────
// [SECURITY] loginLimiter: 5 attempts per 15 min per IP (brute-force prevention)
// [SECURITY] Returns JWT token instead of just { success: true }
// [SECURITY] Uses constant-time comparison to prevent timing attacks
router.post('/login', loginLimiter, (req, res) => {
    const { password } = req.body;

    if (!password || typeof password !== 'string') {
        return res.status(400).json({ success: false, message: 'Password is required' });
    }

    // Constant-time comparison prevents timing attacks that could reveal
    // password length or character matches
    const inputBuffer = Buffer.from(password);
    const correctBuffer = Buffer.from(ADMIN_PASSWORD || '');

    // timingSafeEqual requires same-length buffers, so we also check length
    const isCorrectLength = inputBuffer.length === correctBuffer.length;
    // Pad to same length for the comparison (result is ignored if lengths differ)
    const paddedInput = Buffer.alloc(correctBuffer.length);
    inputBuffer.copy(paddedInput);

    const isMatch = isCorrectLength && crypto.timingSafeEqual(paddedInput, correctBuffer);

    if (isMatch) {
        // Generate JWT for the authenticated session
        const token = generateToken({ role: 'admin' });
        res.json({
            success: true,
            message: 'Login successful',
            token  // Frontend stores this and sends it with subsequent requests
        });
    } else {
        res.status(401).json({ success: false, message: 'Invalid password' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ALL ROUTES BELOW THIS POINT REQUIRE AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════════════════
router.use(requireAuth);

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
        console.error('[Admin Stats]', error.message);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Get recent activity logs
router.get('/activity', async (req, res) => {
    try {
        const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
        const activities = await ActivityLog.find()
            .sort({ timestamp: -1 })
            .limit(limit);

        res.json(activities);
    } catch (error) {
        console.error('[Admin Activity]', error.message);
        res.status(500).json({ error: 'Failed to fetch activities' });
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
        console.error('[Admin Delete Aspiration]', error.message);
        res.status(500).json({ error: 'Failed to delete aspiration' });
    }
});

// Delete documentation
router.delete('/documentation/:id', async (req, res) => {
    try {
        const doc = await Documentation.findByIdAndDelete(req.params.id);

        if (!doc) {
            return res.status(404).json({ error: 'Documentation not found' });
        }

        // Image data is stored in MongoDB as Base64, no file to delete from disk

        // Log activity
        await new ActivityLog({
            action: 'deleted',
            collection: 'documentation',
            itemId: req.params.id,
            details: { title: doc.title }
        }).save();

        res.json({ success: true, message: 'Documentation deleted' });
    } catch (error) {
        console.error('[Admin Delete Documentation]', error.message);
        res.status(500).json({ error: 'Failed to delete documentation' });
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
        console.error('[Admin Update Documentation]', error.message);
        res.status(500).json({ error: 'Failed to update documentation' });
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
        console.error('[Admin Delete Forum]', error.message);
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

module.exports = router;
