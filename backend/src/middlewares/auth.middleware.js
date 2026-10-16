// src/middlewares/auth.middleware.js
// JWT verification middleware — protected route e use hobe
// ✅ NEW: Deactivated user auto logout (401)

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Token nawa (header or cookie)
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Authentication required. Please login.');
    }

    // 2. Token verify
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Token expired. Please login again.');
      }
      throw new ApiError(401, 'Invalid token');
    }

    // 3. User check + populate role
    const user = await User.findById(decoded.userId).populate(
      'role',
      'name permissions'
    );

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    // ✅ 4. Status check — auto logout on deactivate
    if (user.status !== 'active') {
      // Force logout — frontend e 401 handle kore auto logout hobe
      throw new ApiError(
        401,
        `Account is ${user.status}. Please contact admin.`
      );
    }

    // ✅ 5. Effective permissions calculate + attach koro
    // (Frontend + RBAC middleware use korbe)
    const effectivePermissions = user.getEffectivePermissions();

    // 6. req.user e attach koro
    req.user = user;
    req.user.effectivePermissions = effectivePermissions;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;