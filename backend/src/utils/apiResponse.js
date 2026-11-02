// Standard API response helpers — consistent format across all endpoints
const apiResponse = {
    success(res, data = null, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        });
    },

    created(res, data = null, message = 'Created successfully') {
        return this.success(res, data, message, 201);
    },

    error(res, statusCode = 500, message = 'Internal server error', errors = null) {
        const body = { success: false, message, timestamp: new Date().toISOString() };
        if (errors) body.errors = errors;
        return res.status(statusCode).json(body);
    },

    unauthorized(res, message = 'Unauthorized') {
        return this.error(res, 401, message);
    },

    forbidden(res, message = 'Forbidden') {
        return this.error(res, 403, message);
    },

    notFound(res, message = 'Resource not found') {
        return this.error(res, 404, message);
    },

    validationError(res, errors) {
        return this.error(res, 422, 'Validation failed', errors);
    },

    paginated(res, data, pagination, message = 'Success') {
        return res.status(200).json({
            success: true,
            message,
            data,
            pagination,
            timestamp: new Date().toISOString()
        });
    }
};

module.exports = apiResponse;
