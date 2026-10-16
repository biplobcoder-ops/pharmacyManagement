// src/validations/setting.validation.js
// Setting validation schemas

const Joi = require('joi');

const categories = [
  'general', 'invoice', 'expiry', 'notification', 'tax', 'business', 'other'
];

const dataTypes = ['string', 'number', 'boolean', 'array', 'object'];

// Create setting (Admin only)
const createSetting = {
  body: Joi.object({
    key: Joi.string().required().trim().lowercase().max(100).messages({
      'string.max': 'Key cannot exceed 100 characters',
      'any.required': 'Key is required'
    }),
    value: Joi.any().required().messages({
      'any.required': 'Value is required'
    }),
    category: Joi.string().valid(...categories).default('general'),
    label: Joi.string().trim().max(200).allow('', null).optional(),
    description: Joi.string().trim().max(500).allow('', null).optional(),
    dataType: Joi.string().valid(...dataTypes).default('string')
  })
};

// Update by key (value only)
const updateByKey = {
  params: Joi.object({
    key: Joi.string().required().trim().lowercase()
  }),
  body: Joi.object({
    value: Joi.any().required().messages({
      'any.required': 'Value is required'
    })
  })
};

// Bulk update (multiple settings at once)
const bulkUpdate = {
  body: Joi.object({
    settings: Joi.array()
      .items(
        Joi.object({
          key: Joi.string().required().trim().lowercase(),
          value: Joi.any().required()
        })
      )
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one setting is required',
        'any.required': 'Settings array is required'
      })
  })
};

// Get by key
const getByKey = {
  params: Joi.object({
    key: Joi.string().required().trim().lowercase()
  })
};

// Get by category
const getByCategory = {
  params: Joi.object({
    category: Joi.string().valid(...categories).required()
  })
};

// Delete (Admin only — system settings block)
const remove = {
  params: Joi.object({
    key: Joi.string().required().trim().lowercase()
  })
};

module.exports = {
  createSetting,
  updateByKey,
  bulkUpdate,
  getByKey,
  getByCategory,
  remove
};