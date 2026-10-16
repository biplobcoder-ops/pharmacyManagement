// src/validations/user.validation.js
// User validation schemas
// ✅ NEW: updatePermissions, updateStatus, resetPermissions

const Joi = require('joi');

// Reusable ObjectId validator
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ID format'
});

// User create
const createUser = {
  body: Joi.object({
    name: Joi.string().required().trim().min(2).max(100).messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
    email: Joi.string().email().required().trim().lowercase().messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required'
    }),
    phone: Joi.string().trim().allow(null, '').optional(),
    password: Joi.string().required().min(6).max(100).messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required'
    }),
    role: objectId.required().messages({
      'any.required': 'Role is required'
    }),
    branch: objectId.allow(null, '').optional(),
    // ✅ NEW: permissionsOverride optional
    permissionsOverride: Joi.array()
      .items(Joi.string().trim())
      .optional()
      .default([]),
    status: Joi.string().valid('active', 'inactive', 'suspended').default('active'),
    preferences: Joi.object({
      theme: Joi.string().valid('light', 'dark').default('light')
    }).optional()
  })
};

// User update
const updateUser = {
  params: Joi.object({
    id: objectId.required()
  }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    email: Joi.string().email().trim().lowercase().optional(),
    phone: Joi.string().trim().allow(null, '').optional(),
    password: Joi.string().min(6).max(100).optional(),
    role: objectId.optional(),
    branch: objectId.allow(null, '').optional(),
    status: Joi.string().valid('active', 'inactive', 'suspended').optional(),
    preferences: Joi.object({
      theme: Joi.string().valid('light', 'dark')
    }).optional()
  }).min(1).messages({
    'object.min': 'At least one field is required to update'
  })
};

// User get by id
const getById = {
  params: Joi.object({
    id: objectId.required()
  })
};

// User delete
const remove = {
  params: Joi.object({
    id: objectId.required()
  })
};

// Preferences update (theme)
const updatePreferences = {
  body: Joi.object({
    theme: Joi.string().valid('light', 'dark').required().messages({
      'any.only': 'Theme must be light or dark',
      'any.required': 'Theme is required'
    })
  })
};

// ✅ NEW: Update permissions override
const updatePermissions = {
  params: Joi.object({
    id: objectId.required()
  }),
  body: Joi.object({
    permissions: Joi.array()
      .items(
        Joi.string()
          .trim()
          .pattern(/^[a-z-]+:[a-z]+$/)
          .messages({
            'string.pattern.base':
              'Permission must be in format "module:action" (e.g., "sale:view")'
          })
      )
      .required()
      .messages({
        'any.required': 'Permissions array is required',
        'array.base': 'Permissions must be an array'
      })
  })
};

// ✅ NEW: Update user status
const updateStatus = {
  params: Joi.object({
    id: objectId.required()
  }),
  body: Joi.object({
    status: Joi.string()
      .valid('active', 'inactive', 'suspended')
      .required()
      .messages({
        'any.only': 'Status must be active, inactive, or suspended',
        'any.required': 'Status is required'
      })
  })
};

// ✅ NEW: Reset permissions (shudhu params)
const resetPermissions = {
  params: Joi.object({
    id: objectId.required()
  })
};

module.exports = {
  createUser,
  updateUser,
  getById,
  remove,
  updatePreferences,
  // ✅ NEW
  updatePermissions,
  updateStatus,
  resetPermissions
};