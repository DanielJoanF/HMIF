/**
 * Security Middleware - Request Origin / Referer Validation
 * 
 * Secures public API endpoints from unauthorized direct access, scrapers,
 * and external cross-origin requests by verifying headers against whitelisted origins.
 */

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://localhost:5000'];

function validateRequestOrigin(req, res, next) {
    // Only apply to API endpoints
    if (!req.path.startsWith('/api')) {
        return next();
    }

    // Exempt health check (used by Cloud Run, UptimeRobot, container probes)
    if (req.path === '/api/health' || req.path === '/health') {
        return next();
    }

    // Exempt lazy-loaded documentation images (so browser <img> tags work)
    if (req.path.startsWith('/api/documentation/') && req.path.endsWith('/image')) {
        return next();
    }

    const origin = req.headers.origin;
    const referer = req.headers.referer;

    // Developer-friendly: Allow empty origin/referer in non-production for local testing (curl/Postman)
    if (process.env.NODE_ENV !== 'production') {
        if (!origin && !referer) {
            return next();
        }
    }

    // Helper to check if a referrer URL belongs to an allowed origin
    const isAllowedReferer = (url) => {
        if (!url) return false;
        return allowedOrigins.some(allowed => url.startsWith(allowed));
    };

    // 1. Check Origin header (sent by browsers in cross-origin fetch)
    if (origin) {
        if (allowedOrigins.includes(origin)) {
            return next();
        }
    } 
    // 2. Check Referer header (sent by browsers in same-origin fetch and navigation)
    else if (referer) {
        if (isAllowedReferer(referer)) {
            return next();
        }
    }

    // Block the request if neither Origin nor Referer matches the whitelist
    console.warn(`[SECURITY] Blocked request to ${req.path} - Origin: ${origin || 'none'}, Referer: ${referer || 'none'}`);
    return res.status(403).json({
        error: 'Access denied',
        message: 'Direct API access is restricted.'
    });
}

module.exports = { validateRequestOrigin };
