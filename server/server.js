const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');                          // [SECURITY] HTTP security headers
const mongoSanitize = require('express-mongo-sanitize');    // [SECURITY] Prevent NoSQL injection
const { globalLimiter } = require('./middleware/rateLimiter'); // [SECURITY] Global rate limiter
const { validateRequestOrigin } = require('./middleware/security'); // [SECURITY] Validate request origin/referer
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();

// ─── SECURITY: Trust proxy ──────────────────────────────────────────────────
// Required for express-rate-limit to get the real client IP when running
// behind a reverse proxy (Cloud Run, nginx, etc.). Without this, all
// requests appear to come from 127.0.0.1 and rate limiting is useless.
app.set('trust proxy', 1);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─── SECURITY: Helmet — HTTP Security Headers ───────────────────────────────
// Sets ~15 security headers including:
// - Content-Security-Policy (prevents XSS)
// - X-Frame-Options: DENY (prevents clickjacking)
// - Strict-Transport-Security (enforces HTTPS)
// - X-Content-Type-Options: nosniff (prevents MIME sniffing)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://fonts.googleapis.com", "https://www.gstatic.com",
                        // Note: 'unsafe-inline' and 'unsafe-eval' may be needed for Vite development mode.
                        // Remove for production to tighten security.
                        process.env.NODE_ENV === 'development' ? "'unsafe-inline'" : null,
                        process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : null
                       ].filter(Boolean),
            styleSrc: ["'self'", "https://fonts.googleapis.com", "https://www.gstatic.com",
                       process.env.NODE_ENV === 'development' ? "'unsafe-inline'" : null
                      ].filter(Boolean),
            imgSrc: ["'self'", "data:", "https://fonts.googleapis.com", "https://www.gstatic.com"],
            connectSrc: ["'self'", "https://hmif-usd.org", "https://www.hmif-usd.org",
                         // Placeholder for Cloud Run frontend URL, replace with actual URL in production .env
                         process.env.CLOUD_RUN_FRONTEND_URL,
                         // Development URLs
                         'http://localhost:5173', 'http://localhost:5000', 'http://localhost:8000'
                        ].filter(Boolean),
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"]
        },
    },
    crossOriginEmbedderPolicy: { policy: "require-corp" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin" }
}));

// ─── SECURITY: CORS — Restrict Origins ──────────────────────────────────────
// Previously: cors() with no options = allow ALL origins (dangerous)
// Now: whitelist only known frontend origins
// [HARDENED] No longer allows requests without Origin header (curl/scripts)
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://localhost:5000']; // Dev defaults

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no Origin header (health checks, <img> tags,
        // direct browser navigation, server-to-server calls, Cloud Run probes)
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`[CORS] Blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// ─── SECURITY: Request Origin Validation ────────────────────────────────────
// Restricts direct access to JSON endpoints from unauthorized clients or curl.
app.use(validateRequestOrigin);

// ─── SECURITY: Global Rate Limiter ──────────────────────────────────────────
// Catch-all: 50 requests per 15 min per IP (tightened from 100).
// Individual routes have stricter limits applied in their own route files.
app.use(globalLimiter);

// ─── Middleware: Body Parsing ────────────────────────────────────────────────
// Reduced from 10mb to 1mb for JSON — large payloads are only needed for
// documentation image uploads, which use multipart/form-data via multer.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── SECURITY: MongoDB Sanitization ─────────────────────────────────────────
// Strips MongoDB query operators ($gt, $ne, $in, etc.) from request body,
// params, and query strings. Prevents NoSQL injection attacks like:
//   { "password": { "$gt": "" } }  → password is stripped to {}
app.use(mongoSanitize());

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected Successfully!');
    } catch (error) {
        console.error('MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};

connectDB();

// Routes
const forumRoutes = require('./routes/forumRoutes');
const aspirationRoutes = require('./routes/aspirationRoutes');
const documentationRoutes = require('./routes/documentationRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/forum', forumRoutes);
app.use('/api/aspirations', aspirationRoutes);
app.use('/api/documentation', documentationRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
// [SECURITY] Minimal response — do NOT leak infrastructure details (DB type, version, etc.)
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK' });
});

// ─── SECURITY: Error Handler — Hide Details in Production ───────────────────
// Previously: sent err.message to the client (leaks stack traces, DB info, etc.)
// Now: only shows details in development mode
app.use((err, req, res, next) => {
    console.error(err.stack); // Always log full error server-side

    const isDev = process.env.NODE_ENV !== 'production';
    res.status(err.status || 500).json({
        error: 'Something went wrong!',
        // Only expose error details in development
        ...(isDev && { details: err.message })
    });
});

// Serve frontend static files in production (full-stack container)
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    // SPA fallback: serve index.html for any non-API routes
    app.get('*', (req, res) => {
        res.sendFile(path.join(distDir, 'index.html'));
    });
    console.log('Serving frontend from', distDir);
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api/`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});