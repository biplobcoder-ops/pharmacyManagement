// src/validations/notification.validation.js
// Notification validation schemas

const Joi = require('joi');

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ID format'
});

// Get by id
const getById = {
  params: Joi.object({
    id: objectId.required()
  })
};

// Mark as read
const markAsRead = {
  params: Joi.object({
    id: objectId.required()
  })
};

// Mark all as read (optional branch filter)
const markAllAsRead = {
  body: Joi.object({
    branch: objectId.allow(null, '').optional()
  })
};

// Delete
const remove = {
  params: Joi.object({
    id: objectId.required()
  })
};

// Delete all read (optional branch filter)
const deleteAllRead = {
  body: Joi.object({
    branch: objectId.allow(null, '').optional()
  })
};

module.exports = {
  getById,
  markAsRead,
  markAllAsRead,
  remove,
  deleteAllRead
};