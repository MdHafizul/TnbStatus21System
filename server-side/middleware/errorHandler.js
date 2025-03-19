const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
    logger.error(err.stack);

    const response = {
        error: {
            message: err.message || 'Internal Server Error',
            code: err.code || 'INTERNAL_ERROR'
        }
    };

    if (process.env.NODE_ENV !== 'production') {
        response.error.details = err.stack;
    }

    res.status(err.status || 500).json(response);
};