const { body }    = require('express-validator');
const { supabase } = require('../config/database');
const apiResponse  = require('../utils/apiResponse');
const catchAsync   = require('../utils/catchAsync');
const { paginate } = require('../utils/paginate');
const { sanitizeText, getClientIp, generateInquiryRef } = require('../utils/security');
const logger       = require('../config/logger');

// In-memory rate limit: 10 inquiries per IP per 10 minutes
const inquiryRateMap = new Map();
const MAX_INQ = 10;
const INQ_WINDOW_MS = 10 * 60 * 1000;

function checkInquiryRateLimit(ip) {
    const now = Date.now();
    const rec = inquiryRateMap.get(ip) || { count: 0, first: now };
    if (now - rec.first > INQ_WINDOW_MS) {
        inquiryRateMap.set(ip, { count: 1, first: now });
        return { allowed: true };
    }
    if (rec.count >= MAX_INQ) {
        return { allowed: false };
    }
    rec.count++;
    inquiryRateMap.set(ip, rec);
    return { allowed: true };
}

// Normalize aliases (name -> customer_name, phone -> customer_phone, notes -> message)
const normalizeInquiryBody = (req, _res, next) => {
    if (req.body) {
        if (!req.body.customer_name && req.body.name) req.body.customer_name = req.body.name;
        if (!req.body.customer_phone && req.body.phone) req.body.customer_phone = req.body.phone;
        if (!req.body.message && req.body.notes) req.body.message = req.body.notes;
    }
    next();
};

// ─── Validation Rules ─────────────────────────────────────────────────────────
const inquiryValidation = [
    normalizeInquiryBody,
    body('customer_name').trim().notEmpty().withMessage('الاسم مطلوب').isLength({ max: 100 }),
    body('customer_phone')
        .trim().notEmpty().withMessage('رقم الهاتف مطلوب')
        .matches(/^[0-9+\-\s()]{7,20}$/).withMessage('رقم الهاتف غير صحيح'),
    body('customer_email').optional({ checkFalsy: true }).isEmail().withMessage('البريد الإلكتروني غير صحيح'),
    body('customer_city').optional({ checkFalsy: true }).isLength({ max: 100 }),
    body('inquiry_type').optional({ checkFalsy: true }).isIn(['general','price','test_drive','finance','trade_in']),
    body('message').optional({ checkFalsy: true }).isLength({ max: 1500 }),
    body('preferred_contact').optional({ checkFalsy: true }).isIn(['whatsapp','phone','email']),
    body('source').optional({ checkFalsy: true }).isIn(['website','whatsapp','facebook','instagram','referral','walk_in']),
];

// ─── POST /api/inquiries ──────────────────────────────────────────────────────
const createInquiry = catchAsync(async (req, res) => {
    const ip = getClientIp(req);

    // Rate limit (skip if authenticated admin header present)
    if (!req.headers.authorization) {
        const rl = checkInquiryRateLimit(ip);
        if (!rl.allowed) {
            logger.warn(`[Inquiries] Rate limit hit for IP ${ip}`);
            return apiResponse.error(res, 429,
                'لقد أرسلت عدداً كبيراً من الاستفسارات. يرجى الانتظار 10 دقائق');
        }
    }

    const {
        car_id, customer_name, customer_phone,
        customer_email, customer_city,
        inquiry_type = 'general', message,
        preferred_contact = 'whatsapp',
        source = 'website',
        status = 'new',
        staff_notes,
        utm_source, utm_medium, utm_campaign
    } = req.body;

    // Fetch car snapshot if car_id provided (and is a valid UUID)
    let car_snapshot = null;
    const isUuid = car_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(car_id);
    if (isUuid) {
        const { data: car } = await supabase
            .from('cars')
            .select('make,model,year,price,color,slug')
            .eq('id', car_id)
            .single();
        if (car) car_snapshot = car;
    } else if (req.body.car_snapshot) {
        car_snapshot = req.body.car_snapshot;
    }

    const inquiry_ref = generateInquiryRef();
    const validStatuses = ['new','contacted','negotiating','won','lost','cancelled'];
    const safeStatus = validStatuses.includes(status) ? status : 'new';

    const insertPayload = {
        inquiry_ref,
        car_id:         isUuid ? car_id : null,
        car_snapshot,
        customer_name:  sanitizeText(customer_name, 100),
        customer_phone: sanitizeText(customer_phone, 20),
        customer_email: customer_email || null,
        customer_city:  customer_city  || null,
        inquiry_type,
        status:         safeStatus,
        message:        sanitizeText(message || '', 1500),
        preferred_contact,
        source,
        utm_source:    utm_source  || null,
        utm_medium:    utm_medium  || null,
        utm_campaign:  utm_campaign || null,
        client_ip:     ip,
        user_agent:    (req.headers['user-agent'] || '').slice(0, 255)
    };
    if (staff_notes) {
        insertPayload.staff_notes = sanitizeText(staff_notes, 2000);
    }

    const { data: inquiry, error } = await supabase
        .from('inquiries')
        .insert(insertPayload)
        .select('*')
        .single();

    if (error) throw error;

    // Increment car inquiries_count (fire-and-forget)
    if (isUuid) {
        supabase.rpc('increment_inquiries', { car_id_input: car_id }).then();
    }

    // Dispatch to Webhook / Google Sheets if configured
    try {
        const { readSettings, postJsonFollowRedirect } = require('./settings.controller');
        const curSettings = readSettings();
        const syncPayload = {
            event: 'new_inquiry',
            category: 'lead_created',
            timestamp: new Date().toISOString(),
            inquiry_ref: inquiry.inquiry_ref,
            customer_name: inquiry.customer_name,
            customer_phone: inquiry.customer_phone,
            inquiry_type: inquiry.inquiry_type,
            car: car_snapshot ? `${car_snapshot.make} ${car_snapshot.model} ${car_snapshot.year}` : 'استفسار عام',
            message: inquiry.message,
            staff_notes: inquiry.staff_notes || '',
            ip
        };
        if (curSettings.webhook_url) {
            postJsonFollowRedirect(curSettings.webhook_url, syncPayload);
        }
        if (curSettings.google_sheets_webhook_url) {
            postJsonFollowRedirect(curSettings.google_sheets_webhook_url, syncPayload);
        }
    } catch (e) {
        logger.warn('[Inquiries] Webhook forward error:', e.message);
    }

    logger.info(`[Inquiries] New inquiry ${inquiry_ref} for car ${car_id || 'general'} from ${ip}`);

    return apiResponse.created(res, {
        ref: inquiry.inquiry_ref,
        inquiry_ref: inquiry.inquiry_ref,
        id:  inquiry.id,
        inquiry,
        whatsapp_number: process.env.WHATSAPP_NUMBER
    }, 'تم إرسال استفسارك بنجاح. سيتواصل معك فريقنا قريباً');
});

// ─── ADMIN: GET /api/inquiries ────────────────────────────────────────────────
const adminGetInquiries = catchAsync(async (req, res) => {
    const { page = 1, limit = 100, status, car_id, assigned_to } = req.query;

    let countQ = supabase.from('inquiries').select('id', { count: 'exact', head: true });
    let dataQ  = supabase.from('inquiries').select(
        '*, cars(make,model,year,slug,price)'
    );

    if (status)      { countQ = countQ.eq('status', status);      dataQ = dataQ.eq('status', status); }
    if (car_id)      { countQ = countQ.eq('car_id', car_id);      dataQ = dataQ.eq('car_id', car_id); }
    if (assigned_to) { countQ = countQ.eq('assigned_to', assigned_to); dataQ = dataQ.eq('assigned_to', assigned_to); }

    const { count: totalCount } = await countQ;
    const { from, to, pagination } = paginate(page, limit, totalCount || 0);

    const { data: inquiries, error } = await dataQ
        .range(from, to)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return apiResponse.paginated(res, inquiries, pagination);
});

// ─── ADMIN: GET /api/inquiries/:id ────────────────────────────────────────────
const adminGetInquiry = catchAsync(async (req, res) => {
    const { data: inquiry, error } = await supabase
        .from('inquiries')
        .select('*, cars(make,model,year,price,slug,images)')
        .eq('id', req.params.id)
        .single();

    if (error || !inquiry) return apiResponse.notFound(res, 'الاستفسار غير موجود');
    return apiResponse.success(res, inquiry);
});

// ─── ADMIN: PATCH /api/inquiries/:id/status ──────────────────────────────────
const updateInquiryStatus = catchAsync(async (req, res) => {
    let { status, staff_notes, assigned_to, follow_up_date, customer_city, inquiry_type } = req.body;
    // Map UI aliases cleanly to DB enum
    if (status === 'confirmed' || status === 'qualified') status = 'negotiating';
    if (status === 'closed') status = 'won';

    const allowed = ['new','contacted','negotiating','won','lost','cancelled'];

    if (status && !allowed.includes(status)) {
        return apiResponse.validationError(res, [{ field: 'status', message: 'حالة غير صحيحة' }]);
    }

    const updateData = {
        updated_at: new Date().toISOString()
    };
    if (status)                     updateData.status         = status;
    if (staff_notes !== undefined)  updateData.staff_notes    = sanitizeText(String(staff_notes), 2000);
    if (assigned_to !== undefined)  updateData.assigned_to    = assigned_to;
    if (follow_up_date !== undefined) updateData.follow_up_date = follow_up_date;
    if (customer_city !== undefined)  updateData.customer_city  = sanitizeText(String(customer_city), 100);
    if (inquiry_type !== undefined)   updateData.inquiry_type   = inquiry_type;

    const { data: inquiry, error } = await supabase
        .from('inquiries')
        .update(updateData)
        .eq('id', req.params.id)
        .select('*, cars(make,model,year,slug,price)')
        .single();

    if (error) throw error;
    if (!inquiry) return apiResponse.notFound(res, 'الاستفسار غير موجود');

    logger.info(`[Inquiries] Updated inquiry ${req.params.id} → ${status || 'notes'} by ${req.user?.username || 'admin'}`);
    return apiResponse.success(res, inquiry, 'تم تحديث ملف وحالة الحجز بنجاح');
});

// ─── ADMIN: POST /api/inquiries/verify-ref ───────────────────────────────────
const verifyInquiryRef = catchAsync(async (req, res) => {
    const code = String(req.body.code || '').trim();
    if (!code) {
        return apiResponse.error(res, 400, 'يرجى إدخال كود الحجز أو رقم الهاتف');
    }

    // Search by inquiry_ref (case-insensitive) or phone
    const { data: matches, error } = await supabase
        .from('inquiries')
        .select('*, cars(make,model,year,slug,price)')
        .or(`inquiry_ref.ilike.%${code}%,customer_phone.ilike.%${code}%`)
        .order('created_at', { ascending: false })
        .limit(1);

    if (error || !matches || matches.length === 0) {
        return apiResponse.error(res, 404, 'لم يتم العثور على حجز مطابق لهذا الكود أو الرقم');
    }

    const target = matches[0];
    const verifiedNote = `[✅ تم التحقق وتأكيد حضور العميل للمعرض في ${new Date().toLocaleString('ar-EG')}]`;
    const updatedNotes = target.staff_notes
        ? (target.staff_notes.includes('تم التحقق وتأكيد حضور') ? target.staff_notes : `${target.staff_notes} | ${verifiedNote}`)
        : verifiedNote;

    const { data: updated, error: upErr } = await supabase
        .from('inquiries')
        .update({
            status: target.status === 'new' || target.status === 'contacted' ? 'negotiating' : target.status,
            staff_notes: updatedNotes,
            updated_at: new Date().toISOString()
        })
        .eq('id', target.id)
        .select('*, cars(make,model,year,slug,price)')
        .single();

    if (upErr) throw upErr;
    return apiResponse.success(res, updated, 'تم التحقق من الكود وتأكيد حضور العميل بنجاح');
});

module.exports = {
    createInquiry, inquiryValidation,
    adminGetInquiries, adminGetInquiry, updateInquiryStatus, verifyInquiryRef
};
