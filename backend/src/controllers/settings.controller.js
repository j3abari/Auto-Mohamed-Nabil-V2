const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const { supabase } = require('../config/database');
const apiResponse = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');
const { sanitizeText, getClientIp } = require('../utils/security');
const logger = require('../config/logger');

const SETTINGS_FILE = path.join(__dirname, '../../data/settings.json');

const DEFAULT_SETTINGS = {
    showroom_name_ar: 'سوق أوتو محمد نبيل للسيارات',
    showroom_name_en: 'Auto Mohamed Nabil Showroom',
    phone_primary: '01201298587',
    whatsapp_number: '201107108185',
    email: 'info@autonabil.com',
    working_hours: 'يومياً من 11:00 صباحاً حتى 11:00 مساءً',
    address: 'طريق ميت غمر الزقازيق - بجوار بنك قناة السويس، ميت غمر، الدقهلية',
    powered_by_text: 'Performax 1',
    powered_by_url: 'https://performax1.com/',
    announcement_bar: 'عرض الجمعة البيضاء 30% على عمولات التقسيط والفحص المعتمد 100 نقطة',
    announcement_start: '',
    announcement_end: '',
    webhook_url: '',
    google_sheets_webhook_url: '',
    custom_head_code: '',
    maintenance_mode: false
};

function readSettings() {
    try {
        if (!fs.existsSync(SETTINGS_FILE)) {
            fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
            fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf8');
            return { ...DEFAULT_SETTINGS };
        }
        const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (err) {
        logger.error('[Settings] Error reading settings file:', err.message);
        return { ...DEFAULT_SETTINGS };
    }
}

function writeSettings(data) {
    try {
        fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        logger.error('[Settings] Error writing settings file:', err.message);
    }
}

function isSafeWebhookUrl(urlStr) {
    if (!urlStr || typeof urlStr !== 'string') return false;
    try {
        const u = new URL(urlStr);
        return u.protocol === 'https:' || u.protocol === 'http:';
    } catch {
        return false;
    }
}

// HTTP POST with Redirect Following (Crucial for Google Apps Script 302 redirects)
function postJsonFollowRedirect(targetUrl, payload, maxRedirects = 5) {
    if (!targetUrl || maxRedirects <= 0) return;
    try {
        const u = new URL(targetUrl);
        const data = JSON.stringify(payload);
        const client = u.protocol === 'https:' ? https : http;
        const options = {
            hostname: u.hostname,
            port: u.port || (u.protocol === 'https:' ? 443 : 80),
            path: u.pathname + (u.search || ''),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
                'User-Agent': 'AutoMohamedNabil-CRM-Sync/2.5'
            },
            timeout: 10000
        };

        const req = client.request(options, (res) => {
            if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
                const nextUrl = new URL(res.headers.location, targetUrl).toString();
                postJsonFollowRedirect(nextUrl, payload, maxRedirects - 1);
            }
        });
        req.on('error', (err) => logger.warn('[Webhook/Sheets] Dispatch error:', err.message));
        req.write(data);
        req.end();
    } catch (err) {
        logger.warn('[Webhook/Sheets] URL parse error:', err.message);
    }
}

// ─── GET /api/settings (Public) ──────────────────────────────────────────────
const getSettings = catchAsync(async (req, res) => {
    const s = readSettings();
    return apiResponse.success(res, s);
});

// ─── PUT /api/settings (Admin Only) ──────────────────────────────────────────
const updateSettings = catchAsync(async (req, res) => {
    const cur = readSettings();
    const body = req.body || {};
    const clientIp = getClientIp(req);
    const actorName = req.user?.username || req.user?.full_name || 'Admin';

    const updated = {
        ...cur,
        showroom_name_ar: body.showroom_name_ar !== undefined ? sanitizeText(body.showroom_name_ar, 100) : cur.showroom_name_ar,
        showroom_name_en: body.showroom_name_en !== undefined ? sanitizeText(body.showroom_name_en, 100) : cur.showroom_name_en,
        phone_primary:    body.phone_primary !== undefined ? sanitizeText(body.phone_primary, 30) : cur.phone_primary,
        whatsapp_number:  body.whatsapp_number !== undefined ? sanitizeText(body.whatsapp_number, 30) : cur.whatsapp_number,
        email:            body.email !== undefined ? sanitizeText(body.email, 100) : cur.email,
        working_hours:    body.working_hours !== undefined ? sanitizeText(body.working_hours, 150) : cur.working_hours,
        address:          body.address !== undefined ? sanitizeText(body.address, 250) : cur.address,
        powered_by_text:  body.powered_by_text !== undefined ? sanitizeText(body.powered_by_text, 80) : cur.powered_by_text,
        powered_by_url:   body.powered_by_url !== undefined ? sanitizeText(body.powered_by_url, 200) : cur.powered_by_url,
        announcement_bar: body.announcement_bar !== undefined ? sanitizeText(body.announcement_bar, 300) : cur.announcement_bar,
        announcement_start: body.announcement_start !== undefined ? sanitizeText(body.announcement_start, 40) : cur.announcement_start,
        announcement_end:   body.announcement_end !== undefined ? sanitizeText(body.announcement_end, 40) : cur.announcement_end,
        webhook_url:      body.webhook_url !== undefined ? (isSafeWebhookUrl(body.webhook_url) ? body.webhook_url.trim() : '') : cur.webhook_url,
        google_sheets_webhook_url: body.google_sheets_webhook_url !== undefined ? (isSafeWebhookUrl(body.google_sheets_webhook_url) ? body.google_sheets_webhook_url.trim() : '') : cur.google_sheets_webhook_url,
        custom_head_code: body.custom_head_code !== undefined ? String(body.custom_head_code).slice(0, 10000) : cur.custom_head_code,
        maintenance_mode: body.maintenance_mode !== undefined ? Boolean(body.maintenance_mode) : cur.maintenance_mode
    };

    writeSettings(updated);

    // Write audit log
    supabase.from('audit_logs').insert({
        user_id:     req.user?.id || null,
        user_email:  req.user?.email || actorName,
        action:      `تحديث إعدادات المعرض وشريط الإعلانات ووضع الصيانة (${updated.maintenance_mode ? 'مفعل' : 'معطل'})`,
        entity_type: 'settings',
        client_ip:   clientIp,
    }).then(() => {});

    // Dispatch webhook event if configured
    if (updated.webhook_url) {
        postJsonFollowRedirect(updated.webhook_url, {
            event: 'settings_updated',
            timestamp: new Date().toISOString(),
            actor: actorName,
            maintenance_mode: updated.maintenance_mode,
            announcement: updated.announcement_bar
        });
    }

    return apiResponse.success(res, updated, 'تم حفظ إعدادات المعرض بنجاح');
});

// ─── POST /api/sheets/sync-all (Admin Only) ──────────────────────────────────
const syncAllToSheets = catchAsync(async (req, res) => {
    const cur = readSettings();
    const body = req.body || {};
    const clientIp = getClientIp(req);
    const actorName = req.user?.username || 'Admin';

    const targetUrl = (body.url && isSafeWebhookUrl(body.url))
        ? body.url.trim()
        : (cur.google_sheets_webhook_url || cur.webhook_url || '');

    if (!isSafeWebhookUrl(targetUrl)) {
        return apiResponse.error(res, 400, 'يرجى إدخال رابط Google Apps Script Web App صالح (https://script.google.com/macros/s/...)');
    }

    if (body.url) {
        cur.google_sheets_webhook_url = targetUrl;
        writeSettings(cur);
    }

    // Fetch inquiries, logs, and cars from Supabase
    const [
        { data: inquiries = [] },
        { data: logs = [] },
        { data: cars = [] }
    ] = await Promise.all([
        supabase.from('inquiries').select('*').order('created_at', { ascending: false }),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200),
        supabase.from('cars').select('id, make, model, year, price, status, views_count, inquiries_count')
    ]);

    // Send payload to Google Sheets Apps Script
    postJsonFollowRedirect(targetUrl, {
        timestamp: new Date().toISOString(),
        showroom: 'سوق أوتو محمد نبيل للسيارات',
        category: 'bulk_sync',
        actor: actorName,
        ip: clientIp,
        leads: inquiries,
        logs,
        cars,
        settings: cur
    });

    // Write audit log
    supabase.from('audit_logs').insert({
        user_id:     req.user?.id || null,
        user_email:  req.user?.email || actorName,
        action:      `📊 [مزامنة شاملة إلى Google Sheets] إرسال (${inquiries.length}) حجز و (${logs.length}) عملية أمنية`,
        entity_type: 'sync',
        client_ip:   clientIp,
    }).then(() => {});

    return apiResponse.success(res, {
        synced_leads: inquiries.length,
        synced_logs:  logs.length,
        synced_cars:  cars.length
    }, `تم إرسال ${inquiries.length} حجز وعميل و ${logs.length} عملية بنجاح إلى Google Sheets!`);
});

module.exports = {
    getSettings,
    updateSettings,
    syncAllToSheets,
    readSettings,
    postJsonFollowRedirect
};
