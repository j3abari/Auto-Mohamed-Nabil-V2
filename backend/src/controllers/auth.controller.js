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
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
}
function signRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '90d' });
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

// ─── POST /api/auth/users — Create staff account (admin only) ─────────────────
const createStaffUser = catchAsync(async (req, res) => {
    const { display_name, username, password, role, email } = req.body;

    if (!username || !password || !display_name) {
        return apiResponse.error(res, 400, 'الاسم الكامل واسم المستخدم وكلمة المرور مطلوبة');
    }
    if (password.length < 8) {
        return apiResponse.error(res, 400, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل');
    }

    const validRoles = ['admin', 'staff'];
    const assignedRole = validRoles.includes(role) ? role : 'staff';

    // Check username uniqueness
    const { data: existing } = await supabase
        .from('admin_users')
        .select('id')
        .eq('username', username.toLowerCase().trim())
        .single();
    if (existing) {
        return apiResponse.error(res, 409, 'اسم المستخدم مستخدم بالفعل');
    }

    const password_hash = await bcrypt.hash(password, 12);

    const { data: newUser, error } = await supabase.from('admin_users').insert({
        username:      username.toLowerCase().trim(),
        email:         email || `${username.toLowerCase().trim()}@autonabil.com`,
        password_hash,
        full_name:     display_name.trim(),
        role:          assignedRole,
        is_active:     true,
    }).select('id, username, full_name, role, email, created_at').single();

    if (error) throw error;

    // Audit log
    supabase.from('audit_logs').insert({
        user_id:     req.user?.id || null,
        user_email:  req.user?.email || req.user?.username || 'admin',
        action:      `إضافة حساب موظف جديد (${username})`,
        entity_type: 'security',
        client_ip:   getClientIp(req),
    }).then(() => {});

    return apiResponse.success(res, newUser, 'تم إنشاء حساب الموظف بنجاح', 201);
});

// ─── GET /api/auth/users — List all staff accounts (admin only) ──────────────
const listStaffUsers = catchAsync(async (req, res) => {
    const { data, error } = await supabase
        .from('admin_users')
        .select('id, username, full_name, role, email, is_active, last_login, created_at')
        .order('created_at', { ascending: true });

    if (error) throw error;
    return apiResponse.success(res, data || []);
});

// ─── PATCH /api/auth/users/:id — Toggle active/inactive (admin only) ─────────
const toggleStaffStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;

    // Prevent self-deactivation
    if (id === req.user?.id && is_active === false) {
        return apiResponse.error(res, 400, 'لا يمكنك تعطيل حسابك الخاص');
    }

    const { data, error } = await supabase
        .from('admin_users')
        .update({ is_active: Boolean(is_active) })
        .eq('id', id)
        .select('id, username, is_active')
        .single();

    if (error) throw error;
    if (!data) return apiResponse.notFound(res, 'المستخدم غير موجود');

    return apiResponse.success(res, data, is_active ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب');
});

module.exports = { login, refresh, logout, me, loginValidation, createStaffUser, listStaffUsers, toggleStaffStatus };
