// src/validations/branch.validation.js
// Branch validation schemas

const Joi = require('joi');

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ID format'
});

// Create
const createBranch = {
  body: Joi.object({
    organization: objectId.required().messages({
      'any.required': 'Organization is required'
    }),
    name: Joi.string().required().trim().min(2).max(150).messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 150 characters',
      'any.required': 'Name is required'
    }),
    code: Joi.string().required().trim().uppercase().min(2).max(20).messages({
      'string.min': 'Code must be at least 2 characters',
      'string.max': 'Code cannot exceed 20 characters',
      'any.required': 'Code is required'
    }),
    phone: Joi.string().trim().max(20).allow(null, '').optional(),
    email: Joi.string().email().trim().lowercase().allow(null, '').optional(),
    address: Joi.string().required().trim().max(500).messages({
      'any.required': 'Address is required'
    }),
    manager: objectId.allow(null, '').optional(),
    openingHours: Joi.object({
      open: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).default('09:00').messages({
        'string.pattern.base': 'Open time must be HH:mm format'
      }),
      close: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).default('21:00').messages({
        'string.pattern.base': 'Close time must be HH:mm format'
      })
    }).optional(),
    isMainBranch: Joi.boolean().default(false),
    status: Joi.string().valid('active', 'inactive').default('active')
  })
};

// Update
const updateBranch = {
  params: Joi.object({
    id: objectId.required()
  }),
  body: Joi.object({
    organization: objectId.optional(),
    name: Joi.string().trim().min(2).max(150).optional(),
    code: Joi.string().trim().uppercase().min(2).max(20).optional(),
    phone: Joi.string().trim().max(20).allow(null, '').optional(),
    email: Joi.string().email().trim().lowercase().allow(null, '').optional(),
    address: Joi.string().trim().max(500).optional(),
    manager: objectId.allow(null, '').optional(),
    openingHours: Joi.object({
      open: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
      close: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional()
    }).optional(),
    isMainBranch: Joi.boolean().optional(),
    status: Joi.string().valid('active', 'inactive').optional()
  }).min(1).messages({
    'object.min': 'At least one field is required to update'
  })
};

// Get by id
const getById = {
  params: Joi.object({
    id: objectId.required()
  })
};

// Delete
const remove = {
  params: Joi.object({
    id: objectId.required()
  })
};

module.exports = {
  createBranch,
  updateBranch,
  getById,
  remove
};