/**
 * JWT Authentication Middleware
 * 
 * Replaces the insecure client-only sessionStorage check with proper
 * server-side token verification. All admin routes (except /login)
 * must pass through requireAuth().
 */
const jwt = require('jsonwebtoken');

// JWT secret — MUST be set in .env, fallback only for dev safety
const JWT_SECRET = process.env.JWT_SECRET || 'hmif-dev-secret-change-me-in-production';
const TOKEN_EXPIRY = '8h'; // Admin sessions expire after 8 hours

/**
 * Generate a signed JWT for an authenticated admin session.
 * @param {Object} payload — data to encode (e.g. { role: 'admin' })
 * @returns {string} signed JWT
 */
function generateToken(payload = {}) {
    return jwt.sign(
        { ...payload, iat: Math.floor(Date.now() / 1000) },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
    );
}

/**
 * Express middleware: rejects requests without a valid JWT.
 * Expects header: Authorization: Bearer <token>
 */
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    // Check for Authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Authentication required',
            message: 'Missing or malformed Authorization header'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify and decode the token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded; // Attach decoded payload for downstream use
        next();
    } catch (err) {
        // Distinguish between expired and invalid tokens
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired',
                message: 'Please log in again'
            });
        }
        return res.status(401).json({
            error: 'Invalid token',
            message: 'Authentication failed'
        });
    }
}

module.exports = { generateToken, requireAuth };
