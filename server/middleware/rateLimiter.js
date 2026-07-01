/**
 * Rate Limiting Middleware
 * 
 * Tiered rate limiters for different endpoint sensitivity levels.
 * This is the primary defense against the spam attack that hit
 * /api/aspirations with 10,000 requests.
 * 
 * All limiters return JSON (not HTML) to maintain the API contract.
 */
const rateLimit = require('express-rate-limit');

// --- Shared options for all limiters ---
const baseOptions = {
    // Required when behind a reverse proxy (Cloud Run, nginx, etc.)
    // The actual trust proxy setting is in server.js
    standardHeaders: true,  // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,   // Disable `X-RateLimit-*` headers (deprecated)

    // Return JSON instead of HTML on rate limit hit
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json({
            error: 'Too many requests',
            message: `You have exceeded the ${options.limit} request limit. Please try again later.`,
            retryAfter: Math.ceil(options.windowMs / 1000) // seconds
        });
    }
};

/**
 * ASPIRATIONS — Most aggressive limiter (was the spam target)
 * 5 POST requests per 15 minutes per IP
 */
const aspirationLimiter = rateLimit({
    ...baseOptions,
    windowMs: 15 * 60 * 1000,  // 15 minutes
    limit: 5,                   // 5 submissions max
    message: 'Terlalu banyak aspirasi dikirim. Coba lagi dalam 15 menit.'
});

/**
 * FORUM — Moderate limiter
 * 10 POST requests per 15 minutes per IP
 */
const forumLimiter = rateLimit({
    ...baseOptions,
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: 'Terlalu banyak pesan dikirim. Coba lagi dalam 15 menit.'
});

/**
 * CHATBOT — More lenient (chatbot needs frequent back-and-forth)
 * 20 POST requests per 15 minutes per IP
 */
const chatbotLimiter = rateLimit({
    ...baseOptions,
    windowMs: 15 * 60 * 1000,
    limit: 20,
    message: 'Terlalu banyak pesan chatbot. Coba lagi dalam 15 menit.'
});

/**
 * LOGIN — Brute-force prevention
 * 5 attempts per 15 minutes per IP
 */
const loginLimiter = rateLimit({
    ...baseOptions,
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.',
    // Skip successful requests — only count failed attempts would be ideal,
    // but counting all is safer and simpler
});

/**
 * DOCUMENTATION — Upload limiter (admin-only, but defense-in-depth)
 * 10 uploads per 15 minutes per IP
 */
const documentationLimiter = rateLimit({
    ...baseOptions,
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: 'Terlalu banyak upload dokumentasi. Coba lagi dalam 15 menit.'
});

/**
 * READ — Limiter for public GET endpoints
 * Prevents scraping and enumeration attacks.
 * 30 reads per 15 minutes per IP — enough for normal browsing,
 * but blocks automated scraping tools.
 */
const readLimiter = rateLimit({
    ...baseOptions,
    windowMs: 15 * 60 * 1000,
    limit: 30,
    message: 'Terlalu banyak permintaan data. Coba lagi nanti.'
});

/**
 * GLOBAL — Catch-all safety net for all routes
 * 150 requests per 15 minutes per IP (relaxed from 50 to accommodate rapid navigation)
 */
const globalLimiter = rateLimit({
    ...baseOptions,
    windowMs: 15 * 60 * 1000,
    limit: 150,
    message: 'Terlalu banyak permintaan. Coba lagi nanti.'
});

module.exports = {
    aspirationLimiter,
    forumLimiter,
    chatbotLimiter,
    loginLimiter,
    documentationLimiter,
    readLimiter,
    globalLimiter
};
