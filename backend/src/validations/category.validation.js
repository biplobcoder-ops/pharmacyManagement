// src/validations/category.validation.js
// Category validation schemas

const Joi = require('joi');

// Reusable ObjectId
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ID format'
});

// Create
const createCategory = {
  body: Joi.object({
    name: Joi.string().required().trim().min(2).max(100).messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
    description: Joi.string().trim().max(500).allow('', null).optional(),
    parentCategory: objectId.allow(null, '').optional(),
    image: Joi.object({
      url: Joi.string().uri().allow(null, ''),
      publicId: Joi.string().allow(null, '')
    }).optional(),
    sortOrder: Joi.number().integer().min(0).default(0),
    status: Joi.string().valid('active', 'inactive').default('active')
  })
};

// Update
const updateCategory = {
  params: Joi.object({
    id: objectId.required()
  }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    description: Joi.string().trim().max(500).allow('', null).optional(),
    parentCategory: objectId.allow(null, '').optional(),
    image: Joi.object({
      url: Joi.string().uri().allow(null, ''),
      publicId: Joi.string().allow(null, '')
    }).optional(),
    sortOrder: Joi.number().integer().min(0).optional(),
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
  createCategory,
  updateCategory,
  getById,
  remove
};