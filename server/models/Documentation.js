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
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Documentation', documentationSchema);
