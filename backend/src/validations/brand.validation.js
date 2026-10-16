// src/validations/brand.validation.js
// Brand validation schemas

const Joi = require('joi');

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ID format'
});

// Create
const createBrand = {
  body: Joi.object({
    name: Joi.string().required().trim().min(2).max(100).messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
    company: Joi.string().trim().max(200).allow('', null).optional(),
    country: Joi.string().trim().max(100).default('Bangladesh'),
    description: Joi.string().trim().max(500).allow('', null).optional(),
    logo: Joi.object({
      url: Joi.string().uri().allow(null, ''),
      publicId: Joi.string().allow(null, '')
    }).optional(),
    website: Joi.string().uri().allow(null, '').optional(),
    status: Joi.string().valid('active', 'inactive').default('active')
  })
};

// Update
const updateBrand = {
  params: Joi.object({
    id: objectId.required()
  }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    company: Joi.string().trim().max(200).allow('', null).optional(),
    country: Joi.string().trim().max(100).optional(),
    description: Joi.string().trim().max(500).allow('', null).optional(),
    logo: Joi.object({
      url: Joi.string().uri().allow(null, ''),
      publicId: Joi.string().allow(null, '')
    }).optional(),
    website: Joi.string().uri().allow(null, '').optional(),
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
  createBrand,
  updateBrand,
  getById,
  remove
};