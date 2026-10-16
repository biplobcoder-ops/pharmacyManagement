// src/services/audit.service.js
// Audit log service — important action track korbe
// Sob module ei service use korbe

const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

class AuditService {
  /**
   * Audit log create koro
   * @param {Object} data - Log data
   * @param {ObjectId} data.user - User ID
   * @param {String} data.action - login/create/update/delete/etc
   * @param {String} data.module - User/Medicine/Sale/etc
   * @param {ObjectId} data.reference - Affected document ID (optional)
   * @param {Object} data.oldData - Before data (optional)
   * @param {Object} data.newData - After data (optional)
   * @param {Object} data.req - Express request (for IP/userAgent)
   */
  async log(data) {
    try {
      const logData = {
        user: data.user,
        action: data.action,
        module: data.module,
        reference: data.reference || null,
        oldData: this._redactSensitive(data.oldData),
        newData: this._redactSensitive(data.newData),
        ip: data.req?.ip || data.ip || null,
        userAgent: data.req?.headers?.['user-agent'] || data.userAgent || null,
        timestamp: new Date()
      };

      await AuditLog.create(logData);
    } catch (error) {
      // Audit log fail hole main flow break korbo na
      logger.error(`Audit log error: ${error.message}`);
    }
  }

  /**
   * Sensitive data redact koro (password, token, etc.)
   * @private
   */
  _redactSensitive(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    const sensitiveFields = ['password', 'token', 'refreshToken', 'accessToken'];
    const redacted = Array.isArray(obj) ? [...obj] : { ...obj };

    for (const key of Object.keys(redacted)) {
      if (sensitiveFields.includes(key)) {
        redacted[key] = '[REDACTED]';
      } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
        redacted[key] = this._redactSensitive(redacted[key]);
      }
    }

    return redacted;
  }
}

module.exports = new AuditService();