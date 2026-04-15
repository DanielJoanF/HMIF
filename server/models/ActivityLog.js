const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    action: {
        type: String,
        enum: ['created', 'deleted', 'updated'],
        required: true
    },
    collection: {
        type: String,
        enum: ['aspirations', 'documentation', 'forum', 'chatbot'],
        required: true
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId
    },
    details: {
        type: Object
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
