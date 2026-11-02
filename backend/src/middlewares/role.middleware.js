const apiResponse = require('../utils/apiResponse');

/**
 * Restrict access to specific roles
 * Usage: router.use(protect, restrictTo('admin', 'staff'))
 */
const restrictTo = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return apiResponse.forbidden(res, 'ليس لديك صلاحية للوصول لهذا المورد');
    }
    next();
};

module.exports = { restrictTo };
