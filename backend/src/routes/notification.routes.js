// src/routes/notification.routes.js
// Notification routes — ADMIN ONLY

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const ApiError = require('../utils/ApiError');
const { notificationValidation } = require('../validations');

// ✅ ADMIN ONLY middleware
const adminOnly = (req, res, next) => {
  const roleName = req.user?.role?.name;
  if (roleName !== 'admin') {
    return next(new ApiError(403, 'Only admin can access notifications'));
  }
  next();
};

// Sob route protected + admin only
router.use(auth);
router.use(adminOnly);

// Unread count (specific — `/:id` er age)
router.get('/unread', notificationController.getUnreadCount);

// Mark all as read (specific)
router.patch(
  '/read-all',
  validate(notificationValidation.markAllAsRead),
  notificationController.markAllAsRead
);

// Delete all read (specific)
router.delete(
  '/read-all',
  validate(notificationValidation.deleteAllRead),
  notificationController.deleteAllRead
);

// List
router.get('/', notificationController.getAll);

// Mark as read
router.patch(
  '/:id/read',
  validate(notificationValidation.markAsRead),
  notificationController.markAsRead
);

// Get by id + Delete
router
  .route('/:id')
  .get(validate(notificationValidation.getById), notificationController.getById)
  .delete(validate(notificationValidation.remove), notificationController.remove);

module.exports = router;