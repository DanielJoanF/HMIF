const mongoose = require('mongoose');

const documentationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    caption: {
        type: String,
        trim: true
    },
    imageUrl: {
        type: String,
        // Keep for backward compat, but no longer used for new uploads
        default: ''
    },
    imageData: {
        type: String,
        required: true
    },
    imageMimeType: {
        type: String,
        required: true,
        default: 'image/jpeg'
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient sorting by date (avoids memory-heavy in-memory sort)
documentationSchema.index({ uploadedAt: -1 });

module.exports = mongoose.model('Documentation', documentationSchema);
