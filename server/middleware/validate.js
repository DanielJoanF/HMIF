/**
 * Input Validation & Sanitization Middleware
 * 
 * Validates and sanitizes all user input before it reaches route handlers.
 * Defense against XSS (stored), oversized payloads, and malformed data.
 */

// --- Utility: strip HTML tags to prevent stored XSS ---
function stripHtml(str) {
    if (typeof str !== 'string') return '';
    // Remove all HTML tags, then decode common HTML entities
    return str
        .replace(/<[^>]*>/g, '')              // Strip HTML tags
        .replace(/&lt;/g, '<')                 // Decode entities (for display safety)
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'");
}

/**
 * Sanitize a string: trim whitespace, strip HTML, enforce max length.
 * @param {*} str — raw input
 * @param {number} maxLength — maximum allowed characters
 * @returns {string} sanitized string
 */
function sanitizeString(str, maxLength = 1000) {
    if (typeof str !== 'string') return '';
    return stripHtml(str.trim()).substring(0, maxLength);
}

// === Allowed values (must match Mongoose schema enums) ===
const VALID_ASPIRATION_TAGS = ['Umum', 'Akademik', 'Fasilitas', 'Kegiatan'];
const VALID_CHATBOT_SENDERS = ['user', 'bot'];

/**
 * Validate POST /api/aspirations
 * - tag: must be one of the allowed enum values
 * - text: required, 1–1000 characters, HTML stripped
 */
function validateAspiration(req, res, next) {
    let { tag, text } = req.body;

    // Sanitize text
    text = sanitizeString(text, 1000);
    if (!text || text.length === 0) {
        return res.status(400).json({ error: 'Teks aspirasi wajib diisi (maks 1000 karakter).' });
    }

    // Validate tag against enum
    if (tag && !VALID_ASPIRATION_TAGS.includes(tag)) {
        return res.status(400).json({
            error: `Tag tidak valid. Pilih salah satu: ${VALID_ASPIRATION_TAGS.join(', ')}`
        });
    }

    // Write sanitized values back to req.body
    req.body.text = text;
    req.body.tag = tag || 'Umum';
    next();
}

/**
 * Validate POST /api/forum
 * - username: optional, max 50 characters, HTML stripped
 * - text: required, 1–2000 characters, HTML stripped
 */
function validateForumMessage(req, res, next) {
    let { username, text } = req.body;

    // Sanitize text
    text = sanitizeString(text, 2000);
    if (!text || text.length === 0) {
        return res.status(400).json({ error: 'Pesan forum wajib diisi (maks 2000 karakter).' });
    }

    // Sanitize username
    username = sanitizeString(username || '', 50);

    req.body.text = text;
    req.body.username = username || 'Anonymous';
    next();
}

/**
 * Validate POST /api/chatbot
 * - sender: required, must be 'user' or 'bot'
 * - text: required, 1–5000 characters, HTML stripped
 */
function validateChatbotMessage(req, res, next) {
    let { sender, text } = req.body;

    // Validate sender enum
    if (!sender || !VALID_CHATBOT_SENDERS.includes(sender)) {
        return res.status(400).json({
            error: `Sender harus salah satu: ${VALID_CHATBOT_SENDERS.join(', ')}`
        });
    }

    // Sanitize text
    text = sanitizeString(text, 5000);
    if (!text || text.length === 0) {
        return res.status(400).json({ error: 'Pesan chatbot wajib diisi (maks 5000 karakter).' });
    }

    req.body.sender = sender;
    req.body.text = text;
    next();
}

/**
 * Validate POST /api/documentation (used with multer file upload)
 * - title: required, 1–200 characters, HTML stripped
 * - caption: optional, max 500 characters, HTML stripped
 */
function validateDocumentation(req, res, next) {
    let { title, caption } = req.body;

    // Sanitize title
    title = sanitizeString(title, 200);
    if (!title || title.length === 0) {
        return res.status(400).json({ error: 'Judul dokumentasi wajib diisi (maks 200 karakter).' });
    }

    // Sanitize caption
    caption = sanitizeString(caption || '', 500);

    req.body.title = title;
    req.body.caption = caption;
    next();
}

module.exports = {
    sanitizeString,
    validateAspiration,
    validateForumMessage,
    validateChatbotMessage,
    validateDocumentation
};
