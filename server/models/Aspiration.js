const mongoose = require('mongoose');

const aspirationSchema = new mongoose.Schema({
    tag: {
        type: String,
        enum: ['Umum', 'Akademik', 'Fasilitas', 'Kegiatan'],
        default: 'Umum'
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Aspiration', aspirationSchema);
