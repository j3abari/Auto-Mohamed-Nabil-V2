const { validationResult } = require('express-validator');
const apiResponse = require('../utils/apiResponse');

/**
 * Run after express-validator chains — returns 422 if any errors
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formatted = errors.array().map(e => ({ field: e.path, message: e.msg }));
        return apiResponse.validationError(res, formatted);
    }
    next();
};

module.exports = { validate };
