const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const { body }   = require('express-validator');
const apiResponse = require('../utils/apiResponse');
const catchAsync  = require('../utils/catchAsync');
const { safeCompare, getClientIp } = require('../utils/security');
const { revokeToken } = require('../middlewares/auth.middleware');
const { supabase }    = require('../config/database');
const logger          = require('../config/logger');

// ─── Rate Limit Store (in-memory, bounded) ────────────────────────────────────
const loginAttempts = new Map();  // ip → { count, lastAttempt }
const MAX_ATTEMPTS  = 5;
const LOCKOUT_MS    = 15 * 60 * 1000;  // 15 minutes

function checkLoginRateLimit(ip) {
    const now = Date.now();
    const rec = loginAttempts.get(ip);
    if (!rec) return { locked: false };
    if (now - rec.lastAttempt > LOCKOUT_MS) {
        loginAttempts.delete(ip);
        return { locked: false };
    }
    if (rec.count >= MAX_ATTEMPTS) {
        const remaining = Math.ceil((LOCKOUT_MS - (now - rec.lastAttempt)) / 60000);
        return { locked: true, remaining };
    }
    return { locked: false };
}

function recordFailedLogin(ip) {
    const now = Date.now();
    const rec = loginAttempts.get(ip) || { count: 0, lastAttempt: now };
    rec.count++;
    rec.lastAttempt = now;
    loginAttempts.set(ip, rec);
    // Prune map if too large
    if (loginAttempts.size > 5000) {
        const cutoff = now - LOCKOUT_MS;
        for (const [k, v] of loginAttempts) {
            if (v.lastAttempt < cutoff) loginAttempts.delete(k);
        }
    }
}

// ─── Token Generation ─────────────────────────────────────────────────────────
function signAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
}
function signRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

// ─── Validation Rules ─────────────────────────────────────────────────────────
const loginValidation = [
    body('username').trim().notEmpty().withMessage('اسم المستخدم مطلوب').isLength({ max: 100 }),
    body('password').notEmpty().withMessage('كلمة المرور مطلوبة').isLength({ max: 200 })
];

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const login = catchAsync(async (req, res) => {
    const ip = getClientIp(req);

    // Rate limit check
    const rl = checkLoginRateLimit(ip);
    if (rl.locked) {
        logger.warn(`[Auth] Login locked for IP ${ip}`);
        return apiResponse.error(res, 429,
            `تم تجاوز الحد المسموح به. يرجى الانتظار ${rl.remaining} دقيقة`);
    }

    const { username, password } = req.body;

    // Fetch admin user from DB
    const { data: user, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username.toLowerCase().trim())
        .single();

    if (error || !user) {
        recordFailedLogin(ip);
        logger.warn(`[Auth] Failed login attempt for "${username}" from ${ip}`);
        // Same message for wrong user & wrong pass — prevents username enumeration
        return apiResponse.unauthorized(res, 'اسم المستخدم أو كلمة المرور غير صحيحة');
    }

    if (!user.is_active) {
        return apiResponse.forbidden(res, 'هذا الحساب معطل. تواصل مع المسؤول');
    }

    // Verify password (bcrypt)
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        recordFailedLogin(ip);
        logger.warn(`[Auth] Wrong password for "${username}" from ${ip}`);
        return apiResponse.unauthorized(res, 'اسم المستخدم أو كلمة المرور غير صحيحة');
    }

    // Clear failed attempts on success
    loginAttempts.delete(ip);

    // Update last_login
    await supabase.from('admin_users')
        .update({ last_login: new Date().toISOString(), last_ip: ip })
        .eq('id', user.id);

    const tokenPayload = { id: user.id, username: user.username, role: user.role, email: user.email };
    const accessToken  = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    logger.info(`[Auth] Admin "${username}" logged in from ${ip}`);

    // Write audit log for successful login
    supabase.from('audit_logs').insert({
        user_id:     user.id,
        user_email:  user.email || user.username,
        action:      `تسجيل دخول آمن إلى لوحة إدارة المعرض والـ CRM`,
        entity_type: 'auth',
        client_ip:   ip,
        user_agent:  (req.headers['user-agent'] || '').slice(0, 255),
    }).then(({ error: logErr }) => {
        if (logErr) logger.warn('[Audit] login log failed:', logErr.message);
    });

    return apiResponse.success(res, {
        accessToken,
        refreshToken,
        user: {
            id:       user.id,
            username: user.username,
            role:     user.role,
            email:    user.email,
            fullName: user.full_name
        }
    }, 'تم تسجيل الدخول بنجاح');
});

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
const refresh = catchAsync(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return apiResponse.unauthorized(res, 'Refresh token مطلوب');

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const accessToken = signAccessToken({
            id:       decoded.id,
            username: decoded.username,
            role:     decoded.role,
            email:    decoded.email
        });
        return apiResponse.success(res, { accessToken }, 'تم تجديد الرمز');
    } catch {
        return apiResponse.unauthorized(res, 'Refresh token غير صالح أو منتهي الصلاحية');
    }
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
const logout = catchAsync(async (req, res) => {
    if (req.token) revokeToken(req.token);
    logger.info(`[Auth] Admin "${req.user?.username}" logged out`);
    return apiResponse.success(res, null, 'تم تسجيل الخروج بنجاح');
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
const me = catchAsync(async (req, res) => {
    const { data: user, error } = await supabase
        .from('admin_users')
        .select('id, username, role, email, full_name, last_login')
        .eq('id', req.user.id)
        .single();

    if (error || !user) return apiResponse.notFound(res, 'المستخدم غير موجود');
    return apiResponse.success(res, user);
});

module.exports = { login, refresh, logout, me, loginValidation };
