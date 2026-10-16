// src/validations/unit.validation.js
// Unit validation schemas

const Joi = require('joi');

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ID format'
});

// Create
const createUnit = {
  body: Joi.object({
    name: Joi.string().required().trim().min(1).max(50).messages({
      'string.min': 'Name must be at least 1 character',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    }),
    shortName: Joi.string().required().trim().lowercase().min(1).max(10).messages({
      'string.min': 'Short name must be at least 1 character',
      'string.max': 'Short name cannot exceed 10 characters',
      'any.required': 'Short name is required'
    }),
    baseUnit: objectId.allow(null, '').optional(),
    conversionFactor: Joi.number().positive().default(1).messages({
      'number.positive': 'Conversion factor must be positive'
    }),
    description: Joi.string().trim().max(500).allow('', null).optional(),
    status: Joi.string().valid('active', 'inactive').default('active')
  })
};

// Update
const updateUnit = {
  params: Joi.object({
    id: objectId.required()
  }),
  body: Joi.object({
    name: Joi.string().trim().min(1).max(50).optional(),
    shortName: Joi.string().trim().lowercase().min(1).max(10).optional(),
    baseUnit: objectId.allow(null, '').optional(),
    conversionFactor: Joi.number().positive().optional(),
    description: Joi.string().trim().max(500).allow('', null).optional(),
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
  createUnit,
  updateUnit,
  getById,
  remove
};