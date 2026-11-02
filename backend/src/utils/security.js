const crypto = require('crypto');

// ══════════════════════════════════════════════════════════
//  Security Utilities — Auto Mohamed Nabil V2
//  Inspired by Dr. Mahmoud backend_engine.js (Performax 1)
// ══════════════════════════════════════════════════════════

/**
 * Constant-time string comparison — prevents timing attacks on password checks
 */
function safeCompare(a, b) {
    const hashA = crypto.createHash('sha256').update(String(a)).digest();
    const hashB = crypto.createHash('sha256').update(String(b)).digest();
    return crypto.timingSafeEqual(hashA, hashB);
}

/**
 * Extract real client IP — Cloudflare-aware (works on Render.com behind CF)
 */
function getClientIp(req) {
    const cfIp = req.headers['cf-connecting-ip'] || req.headers['true-client-ip'];
    if (cfIp) return String(cfIp).trim().slice(0, 64);

    const xff = req.headers['x-forwarded-for'];
    if (xff) {
        const parts = String(xff).split(',').map(s => s.trim()).filter(Boolean);
        if (parts.length > 0) return parts[parts.length - 1].slice(0, 64);
    }
    return String((req.socket && req.socket.remoteAddress) || 'unknown').slice(0, 64);
}

/**
 * Sanitize plain text — strips HTML tags and trims whitespace
 */
function sanitizeText(input, maxLen = 1000) {
    if (typeof input !== 'string') return '';
    return input
        .replace(/<[^>]*>/g, '')   // strip HTML tags
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')  // strip control chars
        .trim()
        .slice(0, maxLen);
}

/**
 * Escape HTML for server-side rendering
 */
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Generate a unique inquiry reference: INQ-2026-XXXXXX
 */
function generateInquiryRef() {
    const year  = new Date().getFullYear();
    const rand  = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `INQ-${year}-${rand}`;
}

/**
 * Generate a secure random token (for future use)
 */
function generateToken(bytes = 32) {
    return crypto.randomBytes(bytes).toString('hex');
}

module.exports = {
    safeCompare,
    getClientIp,
    sanitizeText,
    escapeHtml,
    generateInquiryRef,
    generateToken
};
