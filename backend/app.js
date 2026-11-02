require('dotenv').config();
const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const logger       = require('./src/config/logger');

// Route imports
const authRoutes      = require('./src/routes/auth.routes');
const carsRoutes      = require('./src/routes/cars.routes');
const inquiryRoutes   = require('./src/routes/inquiries.routes');
const analyticsRoutes = require('./src/routes/analytics.routes');

// Error handlers
const { notFound, errorHandler } = require('./src/middlewares/error.middleware');

const app = express();

// ── Trust proxy (Render.com is behind a proxy) ─────────────────────────────
app.set('trust proxy', 1);

// ── Security Headers (Helmet) ──────────────────────────────────────────────
app.use(helmet({
    crossOriginEmbedderPolicy: false,  // allow embedding from our frontend
    contentSecurityPolicy: {
        directives: {
            defaultSrc:  ["'self'"],
            scriptSrc:   ["'self'"],
            styleSrc:    ["'self'", "'unsafe-inline'"],
            imgSrc:      ["'self'", 'data:', 'https:', 'blob:'],
            connectSrc:  ["'self'"],
            fontSrc:     ["'self'", 'https://fonts.gstatic.com'],
            objectSrc:   ["'none'"],
            upgradeInsecureRequests: []
        }
    }
}));

// ── CORS — strict whitelist ────────────────────────────────────────────────
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        // Allow requests with no origin (curl, Render health checks, mobile)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ── Global rate limiter (prevents DDoS) ────────────────────────────────────
const globalLimiter = rateLimit({
    windowMs:    15 * 60 * 1000,   // 15 minutes
    max:         300,               // 300 req per IP per 15 min
    standardHeaders: true,
    legacyHeaders:   false,
    message: { success: false, message: 'طلبات كثيرة جداً، يرجى الانتظار' }
});
app.use(globalLimiter);

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max:      20,
    message: { success: false, message: 'محاولات تسجيل دخول كثيرة جداً' }
});

// ── Body Parsers ───────────────────────────────────────────────────────────
// Must come before routes; 10kb limit prevents large payload attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── HTTP Request Logger ────────────────────────────────────────────────────
app.use(morgan('combined', {
    stream: { write: msg => logger.info(msg.trim()) }
}));

// ── Health check (Render.com keep-alive) ──────────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Auto Mohamed Nabil V2 API',
        timestamp: new Date().toISOString()
    });
});

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth',       authLimiter, authRoutes);
app.use('/api/cars',       carsRoutes);
app.use('/api/inquiries',  inquiryRoutes);
app.use('/api/analytics',  analyticsRoutes);

// ── 404 + Error handlers ───────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
