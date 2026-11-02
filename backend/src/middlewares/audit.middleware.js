const { supabase } = require('../config/database');
const logger = require('../config/logger');
const { getClientIp } = require('../utils/security');

/**
 * Audit middleware — logs every admin/staff action to DB
 * Attach after protect + restrictTo on admin routes
 */
const auditLog = (action, entityType = null) => async (req, res, next) => {
    // Store original json to capture response data
    const originalJson = res.json.bind(res);
    res.json = function (body) {
        // Log only successful writes (2xx)
        if (res.statusCode >= 200 && res.statusCode < 300) {
            const entityId = req.params.id || body?.data?.id || null;
            supabase.from('audit_logs').insert({
                user_id:     req.user?.id   || null,
                user_email:  req.user?.email || 'system',
                action,
                entity_type: entityType,
                entity_id:   entityId,
                changes:     req.body || null,
                client_ip:   getClientIp(req),
                user_agent:  (req.headers['user-agent'] || '').slice(0, 255)
            }).then(({ error }) => {
                if (error) logger.warn('[Audit] Failed to write audit log:', error.message);
            });
        }
        return originalJson(body);
    };
    next();
};

module.exports = { auditLog };
