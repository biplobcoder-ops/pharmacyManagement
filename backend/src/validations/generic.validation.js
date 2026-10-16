// src/validations/generic.validation.js
// Generic validation schemas

const Joi = require('joi');

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ID format'
});

const dosageForms = [
  'tablet', 'capsule', 'syrup', 'injection',
  'ointment', 'drops', 'inhaler', 'other'
];

// Create
const createGeneric = {
  body: Joi.object({
    name: Joi.string().required().trim().min(2).max(100).messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
    description: Joi.string().trim().max(1000).allow('', null).optional(),
    indications: Joi.string().trim().max(2000).allow('', null).optional(),
    sideEffects: Joi.string().trim().max(2000).allow('', null).optional(),
    contraindications: Joi.string().trim().max(2000).allow('', null).optional(),
    dosageForm: Joi.array().items(Joi.string().valid(...dosageForms)).default([]),
    status: Joi.string().valid('active', 'inactive').default('active')
  })
};

// Update
const updateGeneric = {
  params: Joi.object({
    id: objectId.required()
  }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    description: Joi.string().trim().max(1000).allow('', null).optional(),
    indications: Joi.string().trim().max(2000).allow('', null).optional(),
    sideEffects: Joi.string().trim().max(2000).allow('', null).optional(),
    contraindications: Joi.string().trim().max(2000).allow('', null).optional(),
    dosageForm: Joi.array().items(Joi.string().valid(...dosageForms)).optional(),
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
  createGeneric,
  updateGeneric,
  getById,
  remove
};