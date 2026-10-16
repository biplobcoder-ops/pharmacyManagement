// src/controllers/notification.controller.js
// Notification controller — request handle, service call

const notificationService = require('../services/notification.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/notifications
exports.getAll = asyncHandler(async (req, res) => {
  const result = await notificationService.getAll(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Notifications fetched'));
});

// GET /api/notifications/unread
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const result = await notificationService.getUnreadCount(req.query.branch);
  res.status(200).json(new ApiResponse(200, result, 'Unread count fetched'));
});

// GET /api/notifications/:id
exports.getById = asyncHandler(async (req, res) => {
  const notification = await notificationService.getById(req.params.id);
  res.status(200).json(new ApiResponse(200, notification, 'Notification fetched'));
});

// PATCH /api/notifications/:id/read
exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id);
  res.status(200).json(new ApiResponse(200, notification, 'Marked as read'));
});

// PATCH /api/notifications/read-all
exports.markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.body.branch);
  res.status(200).json(new ApiResponse(200, result, `${result.modifiedCount} notifications marked as read`));
});

// DELETE /api/notifications/:id
exports.remove = asyncHandler(async (req, res) => {
  const result = await notificationService.remove(req.params.id);
  res.status(200).json(new ApiResponse(200, result, result.message));
});

// DELETE /api/notifications/read-all
exports.deleteAllRead = asyncHandler(async (req, res) => {
  const result = await notificationService.deleteAllRead(req.body.branch);
  res.status(200).json(new ApiResponse(200, result, `${result.deletedCount} read notifications deleted`));
});