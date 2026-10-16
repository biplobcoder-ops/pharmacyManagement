// src/middlewares/rbac.middleware.js
// RBAC middleware — permission check
// ✅ NEW: user override + effective permissions support
// Usage: authorize('medicine', 'create')

const ApiError = require('../utils/ApiError');

/**
 * Permission check middleware
 * @param {String} module - Module name (medicine, sale, etc.)
 * @param {String} action - Action name (view, create, update, delete, etc.)
 */
const authorize = (module, action) => {
  return (req, res, next) => {
    try {
      // 1. User + role check
      if (!req.user || !req.user.role) {
        throw new ApiError(401, 'Authentication required');
      }

      const user = req.user;
      const role = user.role;

      // ✅ 2. Admin bypass — full access
      if (role.name === 'admin') {
        return next();
      }

      // ✅ 3. Effective permissions calculate
      // Logic:
      //   - permissionsOverride empty → role.permissions use
      //   - permissionsOverride non-empty → override use
      let userPermissions = [];

      if (
        Array.isArray(user.permissionsOverride) &&
        user.permissionsOverride.length > 0
      ) {
        userPermissions = user.permissionsOverride;
      } else {
        userPermissions = role.permissions || [];
      }

      // ✅ 4. Wildcard check — `*` mane full access
      if (userPermissions.includes('*')) {
        return next();
      }

      // ✅ 5. Specific permission check
      const requiredPermission = `${module}:${action}`;

      if (userPermissions.includes(requiredPermission)) {
        return next();
      }

      // ✅ 6. Manage permission check — `${module}:manage` hole full module access
      const managePermission = `${module}:manage`;
      if (userPermissions.includes(managePermission)) {
        return next();
      }

      // ✅ 7. Permission nai
      throw new ApiError(
        403,
        `Access denied. Required permission: ${requiredPermission}`
      );
    } catch (error) {
      next(error);
    }
  };
};

module.exports = authorize;