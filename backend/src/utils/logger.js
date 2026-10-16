// src/utils/logger.js
// Logger setup — Vercel serverless compatible
// ✅ FIXED: Console-only on Vercel, file logging on local

const winston = require('winston');
const env = require('../config/env');

// ✅ Determine if we're on Vercel
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;

// ✅ Define log format
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

// ✅ Transports — conditional
const transports = [
  // ✅ Console — always
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      logFormat
    )
  })
];

// ✅ File transports — ONLY on local (NOT Vercel)
if (!isVercel && env.NODE_ENV !== 'production') {
  try {
    transports.push(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880,
        maxFiles: 5
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 5242880,
        maxFiles: 5
      })
    );
  } catch (error) {
    console.warn('File logging disabled:', error.message);
  }
}

// ✅ Create logger
const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports,
  exitOnError: false
});

module.exports = logger;
