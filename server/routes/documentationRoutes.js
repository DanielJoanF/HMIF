const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Documentation = require('../models/Documentation');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Use absolute path to the uploads directory in the project root
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
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

// GET all documentation
router.get('/', async (req, res) => {
    try {
        const docs = await Documentation.find().sort({ uploadedAt: -1 });
        res.json(docs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch documentation', details: error.message });
    }
});

// POST new documentation with photo upload
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { title, caption } = req.body;

        if (!title || title.trim() === '') {
            return res.status(400).json({ error: 'Title is required' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        const newDoc = new Documentation({
            title: title.trim(),
            caption: caption?.trim() || '',
            imageUrl
        });

        const savedDoc = await newDoc.save();
        res.status(201).json(savedDoc);
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload documentation', details: error.message });
    }
});

module.exports = router;
