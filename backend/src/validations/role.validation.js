// src/validations/role.validation.js
// Role validation schemas

const Joi = require('joi');

// Reusable ObjectId validator
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ID format'
});

// Role create
const createRole = {
  body: Joi.object({
    name: Joi.string()
      .required()
      .trim()
      .lowercase()
      .min(2)
      .max(50)
      .messages({
        'string.min': 'Role name must be at least 2 characters',
        'string.max': 'Role name cannot exceed 50 characters',
        'any.required': 'Role name is required'
      }),
    description: Joi.string().trim().max(500).allow('', null).optional(),
    permissions: Joi.array().items(Joi.string().trim()).default([]),
    status: Joi.string().valid('active', 'inactive').default('active')
  })
};

// Role update
const updateRole = {
  params: Joi.object({
    id: objectId.required()
  }),
  body: Joi.object({
    name: Joi.string().trim().lowercase().min(2).max(50).optional(),
    description: Joi.string().trim().max(500).allow('', null).optional(),
    permissions: Joi.array().items(Joi.string().trim()).optional(),
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
  createRole,
  updateRole,
  getById,
  remove
};