const { supabase } = require('../config/database');
const { getClientIp } = require('../utils/security');

/**
 * GET /api/audit-logs
 * Returns the 200 most recent audit log entries (admin only)
 */
const getAuditLogs = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 200, 500);
        const { data, error } = await supabase
            .from('audit_logs')
            .select('id, action, entity_type, user_email, client_ip, created_at')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        res.json({ success: true, data: data || [] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * POST /api/audit-logs
 * Allows the admin frontend to write a custom audit log entry
 * Body: { action, entity_type? }
 */
const createAuditLog = async (req, res) => {
    try {
        const { action, entity_type } = req.body;
        if (!action || typeof action !== 'string' || action.trim().length < 2) {
            return res.status(400).json({ success: false, message: 'action مطلوب' });
        }

        const { data, error } = await supabase.from('audit_logs').insert({
            user_id:     req.user?.id    || null,
            user_email:  req.user?.email || req.user?.username || 'admin',
            action:      action.trim().slice(0, 500),
            entity_type: entity_type || 'admin_action',
            client_ip:   getClientIp(req),
            user_agent:  (req.headers['user-agent'] || '').slice(0, 255),
        }).select('id, created_at').single();

        if (error) throw error;

        res.status(201).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getAuditLogs, createAuditLog };
