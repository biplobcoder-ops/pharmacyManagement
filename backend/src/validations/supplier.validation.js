// src/validations/supplier.validation.js
// Supplier validation schemas

const Joi = require('joi');

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ID format'
});

// Create
const createSupplier = {
  body: Joi.object({
    name: Joi.string().required().trim().min(2).max(200).messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 200 characters',
      'any.required': 'Name is required'
    }),
    company: Joi.string().trim().max(200).allow('', null).optional(),
    phone: Joi.string().required().trim().max(20).messages({
      'any.required': 'Phone is required'
    }),
    email: Joi.string().email().trim().lowercase().allow(null, '').optional(),
    address: Joi.string().trim().max(500).allow('', null).optional(),
    contactPerson: Joi.string().trim().max(200).allow('', null).optional(),
    tradeLicense: Joi.string().trim().max(100).allow('', null).optional(),
    taxId: Joi.string().trim().max(100).allow('', null).optional(),
    openingBalance: Joi.number().min(0).default(0),
    notes: Joi.string().trim().max(500).allow('', null).optional(),
    status: Joi.string().valid('active', 'inactive').default('active')
  })
};

// Update
const updateSupplier = {
  params: Joi.object({
    id: objectId.required()
  }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(200).optional(),
    company: Joi.string().trim().max(200).allow('', null).optional(),
    phone: Joi.string().trim().max(20).optional(),
    email: Joi.string().email().trim().lowercase().allow(null, '').optional(),
    address: Joi.string().trim().max(500).allow('', null).optional(),
    contactPerson: Joi.string().trim().max(200).allow('', null).optional(),
    tradeLicense: Joi.string().trim().max(100).allow('', null).optional(),
    taxId: Joi.string().trim().max(100).allow('', null).optional(),
    notes: Joi.string().trim().max(500).allow('', null).optional(),
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
  createSupplier,
  updateSupplier,
  getById,
  remove
};