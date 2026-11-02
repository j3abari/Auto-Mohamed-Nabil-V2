/**
 * Pagination helper for Supabase queries
 * Usage: const { from, to, pagination } = paginate(page, limit, totalCount);
 */
function paginate(page = 1, limit = 12, totalCount = 0) {
    const safePage  = Math.max(1, parseInt(page)  || 1);
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit) || 12));
    const from      = (safePage - 1) * safeLimit;
    const to        = from + safeLimit - 1;
    const totalPages = Math.ceil(totalCount / safeLimit);

    return {
        from,
        to,
        pagination: {
            page:       safePage,
            limit:      safeLimit,
            totalCount,
            totalPages,
            hasNext:    safePage < totalPages,
            hasPrev:    safePage > 1
        }
    };
}

module.exports = { paginate };
