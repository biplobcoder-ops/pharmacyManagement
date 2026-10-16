// src/middlewares/notFound.middleware.js
// 404 handler — jodi kono route match na kore

const ApiError = require('../utils/ApiError');

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

module.exports = notFound;