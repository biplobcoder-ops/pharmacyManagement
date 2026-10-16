// src/validations/organization.validation.js
// Organization validation schemas

const Joi = require('joi');

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ID format'
});

// Create
const createOrganization = {
  body: Joi.object({
    name: Joi.string().required().trim().min(2).max(150).messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 150 characters',
      'any.required': 'Name is required'
    }),
    owner: Joi.string().trim().max(150).allow('', null).optional(),
    phone: Joi.string().trim().max(20).allow(null, '').optional(),
    email: Joi.string().email().trim().lowercase().allow(null, '').optional(),
    address: Joi.string().trim().max(500).allow('', null).optional(),
    logo: Joi.object({
      url: Joi.string().uri().allow(null, ''),
      publicId: Joi.string().allow(null, '')
    }).optional(),
    website: Joi.string().uri().allow(null, '').optional(),
    taxId: Joi.string().trim().max(50).allow(null, '').optional(),
    tradeLicense: Joi.string().trim().max(50).allow(null, '').optional(),
    status: Joi.string().valid('active', 'inactive').default('active')
  })
};

// Update
const updateOrganization = {
  params: Joi.object({
    id: objectId.required()
  }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(150).optional(),
    owner: Joi.string().trim().max(150).allow('', null).optional(),
    phone: Joi.string().trim().max(20).allow(null, '').optional(),
    email: Joi.string().email().trim().lowercase().allow(null, '').optional(),
    address: Joi.string().trim().max(500).allow('', null).optional(),
    logo: Joi.object({
      url: Joi.string().uri().allow(null, ''),
      publicId: Joi.string().allow(null, '')
    }).optional(),
    website: Joi.string().uri().allow(null, '').optional(),
    taxId: Joi.string().trim().max(50).allow(null, '').optional(),
    tradeLicense: Joi.string().trim().max(50).allow(null, '').optional(),
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
  createOrganization,
  updateOrganization,
  getById,
  remove
};