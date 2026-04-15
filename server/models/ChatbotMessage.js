const mongoose = require('mongoose');

const chatbotMessageSchema = new mongoose.Schema({
    sender: {
        type: String,
        enum: ['user', 'bot'],
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ChatbotMessage', chatbotMessageSchema);
