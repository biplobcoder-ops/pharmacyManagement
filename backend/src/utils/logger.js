// src/utils/logger.js
// Logger — Vercel serverless compatible (console-only)

const winston = require('winston');
const env = require('../config/env');

// ✅ Vercel detection
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;

// ✅ Format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    if (stack) {
      return `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`;
    }
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

// ✅ Console only (always)
const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      logFormat
    )
  })
];

// ✅ File logging only on local (NOT Vercel, NOT production)
if (!isVercel && env.NODE_ENV === 'development') {
  try {
    // Create logs dir only if local
    const fs = require('fs');
    const path = require('path');
    const logDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    transports.push(
      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        maxsize: 5242880,
        maxFiles: 5
      }),
      new winston.transports.File({
        filename: path.join(logDir, 'combined.log'),
        maxsize: 5242880,
        maxFiles: 5
      })
    );
  } catch (err) {
    console.warn('File logging disabled:', err.message);
  }
}

const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports,
  exitOnError: false
});

module.exports = logger;
