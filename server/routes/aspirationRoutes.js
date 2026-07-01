const express = require('express');
const router = express.Router();
const Aspiration = require('../models/Aspiration');
const { aspirationLimiter } = require('../middleware/rateLimiter');
const { validateAspiration } = require('../middleware/validate');

// GET all aspirations — with pagination to prevent fetching 10K+ records
// (After the spam attack, the collection may have thousands of entries)
router.get('/', async (req, res) => {
    try {
        // Pagination: ?page=1&limit=100 (default: page 1, 100 per page, max 500)
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(500, Math.max(1, parseInt(req.query.limit) || 100));
        const skip = (page - 1) * limit;

        const [aspirations, total] = await Promise.all([
            Aspiration.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Aspiration.countDocuments()
        ]);

        res.json({
            data: aspirations,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('[Aspirations GET]', error.message);
        res.status(500).json({ error: 'Failed to fetch aspirations' });
    }
});

// POST new aspiration
// [SECURITY] aspirationLimiter: 5 POSTs per 15 min per IP (was the spam target)
// [SECURITY] validateAspiration: sanitizes text, validates tag enum
router.post('/', aspirationLimiter, validateAspiration, async (req, res) => {
    try {
        const { tag, text } = req.body; // Already sanitized by validateAspiration

        const newAspiration = new Aspiration({ tag, text });
        const savedAspiration = await newAspiration.save();
        res.status(201).json(savedAspiration);
    } catch (error) {
        console.error('[Aspirations POST]', error.message);
        res.status(500).json({ error: 'Failed to post aspiration' });
    }
});

module.exports = router;
