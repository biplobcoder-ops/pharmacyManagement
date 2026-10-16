// src/middlewares/error.middleware.js
// Centralized error handler — with DEBUG logging

const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // ✅ DEBUG — always log the full error
  console.log('\n========== ERROR CAUGHT ==========');
  console.log('URL:', req.method, req.originalUrl);
  console.log('Error Name:', error.name);
  console.log('Error Message:', error.message);
  console.log('Status Code:', error.statusCode);
  if (error.errors && error.errors.length > 0) {
    console.log('Errors Array:');
    error.errors.forEach((e, i) => {
      console.log(`  [${i}] field: "${e.field}" | message: "${e.message}"`);
    });
  }
  console.log('Stack:', error.stack?.split('\n').slice(0, 5).join('\n'));
  console.log('==================================\n');

  // ===== Mongoose errors convert =====
  if (error.name === 'CastError') {
    error = new ApiError(400, `Invalid ${error.path}: ${error.value}`);
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    error = new ApiError(409, `${field} already exists`);
  }

  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));
    error = new ApiError(400, 'Validation failed', errors);
  }

  if (error.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token');
  }
  if (error.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token expired');
  }

  if (error.isJoi) {
    const errors = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message
    }));
    error = new ApiError(400, 'Validation failed', errors);
  }

  // ===== Default values =====
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  const errors = error.errors || [];

  // ===== Log error =====
  if (statusCode >= 500) {
    logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method}`);
    if (env.NODE_ENV === 'development') {
      logger.error(error.stack);
    }
  } else {
    logger.warn(`${statusCode} - ${message} - ${req.originalUrl}`);
  }

  // ===== Response =====
  const response = {
    success: false,
    statusCode,
    message,
    errors
  };

  if (env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;