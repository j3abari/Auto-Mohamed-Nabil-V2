const jwt        = require('jsonwebtoken');
const apiResponse = require('../utils/apiResponse');
const { getClientIp } = require('../utils/security');
const logger     = require('../config/logger');

// In-memory token blacklist for logout (bounded, auto-expires with JWT)
const blacklistedTokens = new Set();

/**
 * Protect — verifies JWT and attaches req.user
 */
const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.admin_token) {
        token = req.cookies.admin_token;
    }

    if (!token) {
        return apiResponse.unauthorized(res, 'لم يتم توفير رمز المصادقة');
    }

    if (blacklistedTokens.has(token)) {
        return apiResponse.unauthorized(res, 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user  = decoded;
        req.token = token;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return apiResponse.unauthorized(res, 'انتهت صلاحية الرمز، يرجى تسجيل الدخول مجدداً');
        }
        logger.warn(`[Auth] Invalid token from IP ${getClientIp(req)}: ${err.message}`);
        return apiResponse.unauthorized(res, 'رمز مصادقة غير صالح');
    }
};

/**
 * Blacklist a token on logout
 */
const revokeToken = (token) => {
    blacklistedTokens.add(token);
    // Prune if too large
    if (blacklistedTokens.size > 10000) {
        const iter = blacklistedTokens.values();
        for (let i = 0; i < 2000; i++) blacklistedTokens.delete(iter.next().value);
    }
};

module.exports = { protect, revokeToken };
