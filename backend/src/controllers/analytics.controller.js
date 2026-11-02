const { supabase } = require('../config/database');
const apiResponse  = require('../utils/apiResponse');
const catchAsync   = require('../utils/catchAsync');

// GET /api/admin/analytics/overview
const getOverview = catchAsync(async (req, res) => {
    const [
        { count: totalCars },
        { count: availableCars },
        { count: soldCars },
        { count: totalInquiries },
        { count: newInquiries },
        { count: wonInquiries }
    ] = await Promise.all([
        supabase.from('cars').select('id', { count: 'exact', head: true }),
        supabase.from('cars').select('id', { count: 'exact', head: true }).eq('status', 'available'),
        supabase.from('cars').select('id', { count: 'exact', head: true }).eq('status', 'sold'),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'won'),
    ]);

    // Most viewed cars this month
    const { data: topViewed } = await supabase
        .from('cars')
        .select('id,make,model,year,slug,views_count,inquiries_count,images')
        .order('views_count', { ascending: false })
        .limit(5);

    // Recent inquiries
    const { data: recentInquiries } = await supabase
        .from('inquiries')
        .select('id,inquiry_ref,customer_name,customer_phone,inquiry_type,status,created_at,car_snapshot')
        .order('created_at', { ascending: false })
        .limit(10);

    return apiResponse.success(res, {
        stats: {
            totalCars,
            availableCars,
            soldCars,
            totalInquiries,
            newInquiries,
            wonInquiries,
            conversionRate: totalInquiries > 0
                ? ((wonInquiries / totalInquiries) * 100).toFixed(1) + '%'
                : '0%'
        },
        topViewed,
        recentInquiries
    });
});

module.exports = { getOverview };
