const { body }    = require('express-validator');
const { supabase } = require('../config/database');
const apiResponse  = require('../utils/apiResponse');
const catchAsync   = require('../utils/catchAsync');
const { paginate } = require('../utils/paginate');
const { sanitizeText, getClientIp, generateInquiryRef } = require('../utils/security');
const logger       = require('../config/logger');

// In-memory rate limit: 3 inquiries per IP per 10 minutes
const inquiryRateMap = new Map();
const MAX_INQ = 3;
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

// ─── Validation Rules ─────────────────────────────────────────────────────────
const inquiryValidation = [
    body('customer_name').trim().notEmpty().withMessage('الاسم مطلوب').isLength({ max: 100 }),
    body('customer_phone')
        .trim().notEmpty().withMessage('رقم الهاتف مطلوب')
        .matches(/^[0-9+\-\s()]{7,20}$/).withMessage('رقم الهاتف غير صحيح'),
    body('customer_email').optional().isEmail().withMessage('البريد الإلكتروني غير صحيح'),
    body('customer_city').optional().isLength({ max: 100 }),
    body('inquiry_type').optional().isIn(['general','price','test_drive','finance','trade_in']),
    body('message').optional().isLength({ max: 1000 }),
    body('preferred_contact').optional().isIn(['whatsapp','phone','email']),
    body('source').optional().isIn(['website','whatsapp','facebook','instagram','referral','walk_in']),
];

// ─── POST /api/inquiries ──────────────────────────────────────────────────────
const createInquiry = catchAsync(async (req, res) => {
    const ip = getClientIp(req);

    // Rate limit
    const rl = checkInquiryRateLimit(ip);
    if (!rl.allowed) {
        logger.warn(`[Inquiries] Rate limit hit for IP ${ip}`);
        return apiResponse.error(res, 429,
            'لقد أرسلت عدداً كبيراً من الاستفسارات. يرجى الانتظار 10 دقائق');
    }

    const {
        car_id, customer_name, customer_phone,
        customer_email, customer_city,
        inquiry_type = 'general', message,
        preferred_contact = 'whatsapp',
        source = 'website',
        utm_source, utm_medium, utm_campaign
    } = req.body;

    // Fetch car snapshot if car_id provided
    let car_snapshot = null;
    if (car_id) {
        const { data: car } = await supabase
            .from('cars')
            .select('make,model,year,price,color,slug')
            .eq('id', car_id)
            .single();
        if (car) car_snapshot = car;
    }

    const inquiry_ref = generateInquiryRef();

    const { data: inquiry, error } = await supabase.from('inquiries').insert({
        inquiry_ref,
        car_id:         car_id || null,
        car_snapshot,
        customer_name:  sanitizeText(customer_name, 100),
        customer_phone: sanitizeText(customer_phone, 20),
        customer_email: customer_email || null,
        customer_city:  customer_city  || null,
        inquiry_type,
        message:        sanitizeText(message || '', 1000),
        preferred_contact,
        source,
        utm_source:    utm_source  || null,
        utm_medium:    utm_medium  || null,
        utm_campaign:  utm_campaign || null,
        client_ip:     ip,
        user_agent:    (req.headers['user-agent'] || '').slice(0, 255)
    }).select('id, inquiry_ref, created_at').single();

    if (error) throw error;

    // Increment car inquiries_count (fire-and-forget)
    if (car_id) {
        supabase.rpc('increment_inquiries', { car_id_input: car_id }).then();
    }

    logger.info(`[Inquiries] New inquiry ${inquiry_ref} for car ${car_id || 'general'} from ${ip}`);

    return apiResponse.created(res, {
        ref: inquiry.inquiry_ref,
        id:  inquiry.id,
        whatsapp_number: process.env.WHATSAPP_NUMBER
    }, 'تم إرسال استفسارك بنجاح. سيتواصل معك فريقنا قريباً');
});

// ─── ADMIN: GET /api/admin/inquiries ─────────────────────────────────────────
const adminGetInquiries = catchAsync(async (req, res) => {
    const { page = 1, limit = 20, status, car_id, assigned_to } = req.query;

    let countQ = supabase.from('inquiries').select('id', { count: 'exact', head: true });
    let dataQ  = supabase.from('inquiries').select(
        '*, cars(make,model,year,slug)'
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

// ─── ADMIN: GET /api/admin/inquiries/:id ──────────────────────────────────────
const adminGetInquiry = catchAsync(async (req, res) => {
    const { data: inquiry, error } = await supabase
        .from('inquiries')
        .select('*, cars(make,model,year,price,slug,images)')
        .eq('id', req.params.id)
        .single();

    if (error || !inquiry) return apiResponse.notFound(res, 'الاستفسار غير موجود');
    return apiResponse.success(res, inquiry);
});

// ─── ADMIN: PATCH /api/admin/inquiries/:id/status ────────────────────────────
const updateInquiryStatus = catchAsync(async (req, res) => {
    const { status, staff_notes, assigned_to, follow_up_date } = req.body;
    const allowed = ['new','contacted','negotiating','won','lost','cancelled'];

    if (status && !allowed.includes(status)) {
        return apiResponse.validationError(res, [{ field: 'status', message: 'حالة غير صحيحة' }]);
    }

    const updateData = {
        updated_at: new Date().toISOString()
    };
    if (status)         updateData.status        = status;
    if (staff_notes)    updateData.staff_notes    = sanitizeText(staff_notes, 2000);
    if (assigned_to)    updateData.assigned_to    = assigned_to;
    if (follow_up_date) updateData.follow_up_date = follow_up_date;

    const { data: inquiry, error } = await supabase
        .from('inquiries')
        .update(updateData)
        .eq('id', req.params.id)
        .select()
        .single();

    if (error) throw error;
    if (!inquiry) return apiResponse.notFound(res, 'الاستفسار غير موجود');

    logger.info(`[Inquiries] Updated inquiry ${req.params.id} → ${status} by ${req.user.username}`);
    return apiResponse.success(res, inquiry, 'تم تحديث حالة الاستفسار');
});

module.exports = {
    createInquiry, inquiryValidation,
    adminGetInquiries, adminGetInquiry, updateInquiryStatus
};
