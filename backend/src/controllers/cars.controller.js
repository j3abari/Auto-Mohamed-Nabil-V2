const { body, query, param } = require('express-validator');
const { supabase }   = require('../config/database');
const apiResponse    = require('../utils/apiResponse');
const catchAsync     = require('../utils/catchAsync');
const { paginate }   = require('../utils/paginate');
const { sanitizeText } = require('../utils/security');
const logger         = require('../config/logger');

// ─── Validation Rules ─────────────────────────────────────────────────────────
const carValidation = [
    body('make').trim().notEmpty().withMessage('الماركة مطلوبة').isLength({ max: 100 }),
    body('model').trim().notEmpty().withMessage('الموديل مطلوب').isLength({ max: 100 }),
    body('year').isInt({ min: 1990, max: new Date().getFullYear() + 1 }).withMessage('السنة غير صحيحة'),
    body('price').isFloat({ min: 0 }).withMessage('السعر يجب أن يكون رقماً موجباً'),
    body('condition').optional().isIn(['new', 'used', 'certified']).withMessage('الحالة غير صحيحة'),
    body('fuel_type').optional().isIn(['petrol', 'diesel', 'electric', 'hybrid']),
    body('transmission').optional().isIn(['automatic', 'manual']),
    body('body_type').optional().isLength({ max: 50 }),
    body('mileage').optional().isInt({ min: 0 }),
    body('color').optional().isLength({ max: 50 }),
    body('description').optional().isLength({ max: 3000 }),
    body('status').optional().isIn(['available', 'reserved', 'sold', 'pending']),
];

// ─── Helper: build slug ───────────────────────────────────────────────────────
function buildSlug(make, model, year) {
    const base = `${make}-${model}-${year}`
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .slice(0, 80);
    const rand = Math.random().toString(36).slice(2, 6);
    return `${base}-${rand}`;
}

// ══════════════════════════════════════════════════════════
//  PUBLIC ENDPOINTS
// ══════════════════════════════════════════════════════════

// GET /api/cars  — list with filters + pagination
const getCars = catchAsync(async (req, res) => {
    const {
        page = 1, limit = 12,
        make, model, year_min, year_max,
        price_min, price_max,
        fuel_type, transmission, body_type, condition,
        status = 'available',
        featured, sort = 'created_at', order = 'desc'
    } = req.query;

    // Count query
    let countQ = supabase.from('cars').select('id', { count: 'exact', head: true })
        .eq('is_published', true);

    // Data query
    let dataQ = supabase.from('cars').select(
        'id,slug,make,model,year,variant,body_type,condition,price,original_price,' +
        'price_negotiable,mileage,fuel_type,transmission,color,seats,status,' +
        'is_featured,images,views_count,inquiries_count,created_at'
    ).eq('is_published', true);

    // Apply filters to both
    const applyFilters = (q) => {
        if (status)       q = q.eq('status', status);
        if (make)         q = q.ilike('make', `%${make}%`);
        if (model)        q = q.ilike('model', `%${model}%`);
        if (year_min)     q = q.gte('year', parseInt(year_min));
        if (year_max)     q = q.lte('year', parseInt(year_max));
        if (price_min)    q = q.gte('price', parseFloat(price_min));
        if (price_max)    q = q.lte('price', parseFloat(price_max));
        if (fuel_type)    q = q.eq('fuel_type', fuel_type);
        if (transmission) q = q.eq('transmission', transmission);
        if (body_type)    q = q.eq('body_type', body_type);
        if (condition)    q = q.eq('condition', condition);
        if (featured === 'true') q = q.eq('is_featured', true);
        return q;
    };

    countQ = applyFilters(countQ);
    dataQ  = applyFilters(dataQ);

    const { count: totalCount } = await countQ;
    const { from, to, pagination } = paginate(page, limit, totalCount || 0);

    const allowedSort = ['created_at', 'price', 'year', 'mileage', 'views_count'];
    const safeSort    = allowedSort.includes(sort) ? sort : 'created_at';
    const safeOrder   = order === 'asc' ? true : false;

    dataQ = dataQ.range(from, to).order(safeSort, { ascending: safeOrder });

    const { data: cars, error } = await dataQ;
    if (error) throw error;

    return apiResponse.paginated(res, cars, pagination);
});

// GET /api/cars/featured — homepage featured cars
const getFeaturedCars = catchAsync(async (req, res) => {
    const { data: cars, error } = await supabase
        .from('cars')
        .select(
            'id,slug,make,model,year,variant,body_type,price,original_price,' +
            'mileage,fuel_type,transmission,color,status,images,is_featured'
        )
        .eq('is_published', true)
        .eq('is_featured', true)
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(8);

    if (error) throw error;
    return apiResponse.success(res, cars);
});

// GET /api/cars/search?q=
const searchCars = catchAsync(async (req, res) => {
    const q = sanitizeText(req.query.q || '', 100);
    if (!q || q.length < 2) {
        return apiResponse.validationError(res, [{ field: 'q', message: 'الحد الأدنى للبحث حرفان' }]);
    }

    const { data: cars, error } = await supabase
        .from('cars')
        .select('id,slug,make,model,year,variant,price,color,images,status')
        .eq('is_published', true)
        .or(`make.ilike.%${q}%,model.ilike.%${q}%,variant.ilike.%${q}%,color.ilike.%${q}%`)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) throw error;
    return apiResponse.success(res, cars);
});

// GET /api/cars/:slug — car detail (public)
const getCarBySlug = catchAsync(async (req, res) => {
    const { slug } = req.params;

    const { data: car, error } = await supabase
        .from('cars')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

    if (error || !car) return apiResponse.notFound(res, 'السيارة غير موجودة');

    // Increment views (fire-and-forget, don't block response)
    supabase.from('cars')
        .update({ views_count: (car.views_count || 0) + 1 })
        .eq('id', car.id)
        .then();

    return apiResponse.success(res, car);
});

// ══════════════════════════════════════════════════════════
//  ADMIN ENDPOINTS
// ══════════════════════════════════════════════════════════

// GET /api/admin/cars — all cars (incl. unpublished)
const adminGetCars = catchAsync(async (req, res) => {
    const { page = 1, limit = 20, status, make } = req.query;

    let countQ = supabase.from('cars').select('id', { count: 'exact', head: true });
    let dataQ  = supabase.from('cars').select('*');

    if (status) { countQ = countQ.eq('status', status); dataQ = dataQ.eq('status', status); }
    if (make)   { countQ = countQ.ilike('make', `%${make}%`); dataQ = dataQ.ilike('make', `%${make}%`); }

    const { count: totalCount } = await countQ;
    const { from, to, pagination } = paginate(page, limit, totalCount || 0);

    const { data: cars, error } = await dataQ
        .range(from, to)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return apiResponse.paginated(res, cars, pagination);
});

// POST /api/admin/cars
const createCar = catchAsync(async (req, res) => {
    const {
        make, model, year, variant, body_type, condition = 'used',
        price, original_price, price_negotiable = false,
        mileage, fuel_type, transmission, engine_cc, horsepower,
        color, interior_color, seats = 5, doors = 4, drive_type,
        status = 'available', is_featured = false, is_published = true,
        description, features, images = [], inspection_report,
        meta_title, meta_description, whatsapp_desc
    } = req.body;

    const slug = buildSlug(make, model, year);

    const { data: car, error } = await supabase.from('cars').insert({
        slug, make, model, year, variant, body_type, condition,
        price, original_price, price_negotiable,
        mileage, fuel_type, transmission, engine_cc, horsepower,
        color, interior_color, seats, doors, drive_type,
        status, is_featured, is_published,
        description: sanitizeText(description || '', 3000),
        features: features || [],
        images: images || [],
        inspection_report,
        meta_title: meta_title || `${make} ${model} ${year}`,
        meta_description,
        whatsapp_desc,
        created_by: req.user.id
    }).select().single();

    if (error) throw error;

    logger.info(`[Cars] Created car "${make} ${model} ${year}" by ${req.user.username}`);
    return apiResponse.created(res, car, 'تم إضافة السيارة بنجاح');
});

// PUT /api/admin/cars/:id
const updateCar = catchAsync(async (req, res) => {
    const { id } = req.params;

    // Sanitize description if provided
    if (req.body.description) {
        req.body.description = sanitizeText(req.body.description, 3000);
    }

    const { data: car, error } = await supabase
        .from('cars')
        .update({ ...req.body, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    if (!car) return apiResponse.notFound(res, 'السيارة غير موجودة');

    logger.info(`[Cars] Updated car ${id} by ${req.user.username}`);
    return apiResponse.success(res, car, 'تم تحديث السيارة بنجاح');
});

// DELETE /api/admin/cars/:id  (soft delete → archived)
const deleteCar = catchAsync(async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase
        .from('cars')
        .update({ status: 'archived', is_published: false, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) throw error;

    logger.info(`[Cars] Archived car ${id} by ${req.user.username}`);
    return apiResponse.success(res, null, 'تم حذف السيارة (أرشفة)');
});

// PATCH /api/admin/cars/:id/publish
const togglePublish = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { data: car } = await supabase.from('cars').select('is_published').eq('id', id).single();
    if (!car) return apiResponse.notFound(res, 'السيارة غير موجودة');

    const newVal = !car.is_published;
    await supabase.from('cars').update({ is_published: newVal }).eq('id', id);
    return apiResponse.success(res, { is_published: newVal },
        newVal ? 'تم نشر السيارة' : 'تم إلغاء نشر السيارة');
});

// PATCH /api/admin/cars/:id/feature
const toggleFeature = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { data: car } = await supabase.from('cars').select('is_featured').eq('id', id).single();
    if (!car) return apiResponse.notFound(res, 'السيارة غير موجودة');

    const newVal = !car.is_featured;
    await supabase.from('cars').update({ is_featured: newVal }).eq('id', id);
    return apiResponse.success(res, { is_featured: newVal },
        newVal ? 'تم تمييز السيارة كمميزة' : 'تم إلغاء التمييز');
});

module.exports = {
    getCars, getFeaturedCars, searchCars, getCarBySlug,
    adminGetCars, createCar, updateCar, deleteCar, togglePublish, toggleFeature,
    carValidation
};
