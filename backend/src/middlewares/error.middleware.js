const logger     = require('../config/logger');
const apiResponse = require('../utils/apiResponse');

// 404 handler
const notFound = (req, res) => {
    return apiResponse.notFound(res, `المسار غير موجود: ${req.originalUrl}`);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message    = err.message    || 'خطأ في الخادم';

    // Supabase / Postgres errors
    if (err.code === '23505') {
        statusCode = 409;
        message = 'هذا السجل موجود بالفعل';
    }

    // JWT errors (shouldn't reach here, but just in case)
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'رمز مصادقة غير صالح';
    }

    // Log server errors
    if (statusCode >= 500) {
        logger.error(`[${req.method}] ${req.originalUrl} — ${statusCode}: ${message}`, err);
    }

    return apiResponse.error(res, statusCode, message);
};

module.exports = { notFound, errorHandler };
