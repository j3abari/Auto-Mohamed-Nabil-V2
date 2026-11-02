require('dotenv').config();
const path         = require('path');
const fs           = require('fs');
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
const auditRoutes     = require('./src/routes/audit.routes');
const settingsRoutes  = require('./src/routes/settings.routes');

// Error handlers
const { notFound, errorHandler } = require('./src/middlewares/error.middleware');

const app = express();

// ── Trust proxy (Render.com is behind a proxy) ─────────────────────────────
app.set('trust proxy', 1);

// ── Security Headers (Helmet) ──────────────────────────────────────────────
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,       // Allows external Google Fonts and Unsplash images
    crossOriginResourcePolicy: false,   // Prevents blocking of static module scripts
}));

// ── Static Frontend Assets (MUST BE SERVED BEFORE CORS TO PREVENT 500s) ───
const publicDistPath = fs.existsSync(path.join(__dirname, 'public'))
    ? path.join(__dirname, 'public')
    : path.join(__dirname, '../frontend/dist');
const hasFrontendDist = fs.existsSync(publicDistPath);

if (hasFrontendDist) {
    app.use(express.static(publicDistPath, {
        etag: true,
        setHeaders: (res, filePath) => {
            if (filePath.endsWith('.html')) {
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.setHeader('Pragma', 'no-cache');
                res.setHeader('Expires', '0');
            } else if (filePath.includes('assets')) {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            }
        }
    }));
}

// ── CORS — Allow local network, production domain, and any render subdomain ─
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    process.env.CLIENT_URL,
    'https://auto-mohamed-nabil-v2.onrender.com',
    'https://auto-mohamed-nabil-v2.onrender.co'
].filter(Boolean);

const isLocalOrPrivateOrigin = (origin) => {
    try {
        const url = new URL(origin);
        const host = url.hostname;
        return (
            host === 'localhost' ||
            host === '127.0.0.1' ||
            host.startsWith('192.168.') ||
            host.startsWith('10.') ||
            (host.startsWith('172.') && parseInt(host.split('.')[1], 10) >= 16 && parseInt(host.split('.')[1], 10) <= 31) ||
            host.endsWith('.local') ||
            host.includes('ngrok') ||
            host.includes('loca.lt') ||
            host.includes('trycloudflare.com')
        );
    } catch {
        return false;
    }
};

app.use(cors({
    origin(origin, callback) {
        // Allow requests with no origin (curl, mobile apps, local server-to-server)
        if (!origin) return callback(null, true);

        // Check exact match, render subdomains, local WiFi IPs, or development mode
        const isAllowed = allowedOrigins.includes(origin) ||
            origin.endsWith('.onrender.com') ||
            origin.endsWith('.onrender.co') ||
            isLocalOrPrivateOrigin(origin) ||
            process.env.NODE_ENV === 'development';

        if (isAllowed) {
            return callback(null, true);
        }

        // Return false instead of throwing Error so static files are not broken with 500
        return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ── Global rate limiter (prevents DDoS on API) ─────────────────────────────
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'طلبات كثيرة جداً، يرجى الانتظار' }
});
app.use('/api/', globalLimiter);

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'محاولات تسجيل دخول كثيرة جداً' }
});

// ── Body Parsers ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true, limit: '20kb' }));

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
app.use('/api/audit-logs', auditRoutes);
app.use('/api/settings',   settingsRoutes);

// ── SPA Fallback (serve index.html for all non-API paths) ───────────────────
if (hasFrontendDist) {
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api/')) return next();
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.sendFile(path.join(publicDistPath, 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.json({ service: 'Auto Mohamed Nabil V2 API', status: 'running', version: '1.0.3' });
    });
}

// ── 404 + Error handlers ───────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
