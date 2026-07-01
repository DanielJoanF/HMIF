const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Documentation = require('../models/Documentation');
const { validateDocumentation } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { documentationLimiter } = require('../middleware/rateLimiter');

// Configure multer to use memory storage (no disk writes)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// GET all documentation (metadata only — excludes heavy imageData field)
router.get('/', async (req, res) => {
    try {
        const docs = await Documentation.find()
            .select('-imageData')          // Exclude Base64 blob to avoid 32MB sort limit
            .sort({ uploadedAt: -1 });
        res.json(docs);
    } catch (error) {
        console.error('[Documentation GET]', error.message);
        res.status(500).json({ error: 'Failed to fetch documentation' });
    }
});

// GET single image data by document ID (lazy-load)
router.get('/:id/image', async (req, res) => {
    try {
        const doc = await Documentation.findById(req.params.id)
            .select('imageData imageMimeType');
        if (!doc) {
            return res.status(404).json({ error: 'Image not found' });
        }

        // Return raw binary image instead of JSON for browser <img> compatibility
        const imgBuffer = Buffer.from(doc.imageData, 'base64');
        res.set('Content-Type', doc.imageMimeType || 'image/jpeg');
        res.set('Cache-Control', 'public, max-age=86400'); // Cache 24h
        res.send(imgBuffer);
    } catch (error) {
        console.error('[Documentation GET Image]', error.message);
        res.status(500).json({ error: 'Failed to fetch image' });
    }
});

// POST new documentation with photo upload
// [SECURITY] requireAuth: JWT authentication required (admin-only)
// [SECURITY] documentationLimiter: 10 uploads per 15 min per IP
// [SECURITY] validateDocumentation: sanitizes title + caption, enforces max length
// Note: multer runs first to parse multipart form data, then validation runs
router.post('/', requireAuth, documentationLimiter, upload.single('image'), validateDocumentation, async (req, res) => {
    try {
        const { title, caption } = req.body; // Already sanitized by middleware

        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required' });
        }

        // Convert file buffer to Base64 string
        const imageData = req.file.buffer.toString('base64');
        const imageMimeType = req.file.mimetype;

        const newDoc = new Documentation({
            title,
            caption,
            imageData,
            imageMimeType
        });

        const savedDoc = await newDoc.save();
        res.status(201).json(savedDoc);
    } catch (error) {
        console.error('[Documentation POST]', error.message);
        res.status(500).json({ error: 'Failed to upload documentation' });
    }
});

module.exports = router;
