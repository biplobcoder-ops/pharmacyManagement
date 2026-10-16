// src/validations/medicine.validation.js
// Medicine validation schemas — FormData safe

const Joi = require('joi');

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ID format'
});

const dosageForms = [
  'tablet', 'capsule', 'syrup', 'suspension', 'injection',
  'ointment', 'cream', 'gel', 'drops', 'inhaler',
  'spray', 'suppository', 'powder', 'other'
];

// ✅ Custom boolean that accepts string "true"/"false" from FormData
const booleanString = Joi.alternatives()
  .try(Joi.boolean(), Joi.string().valid('true', 'false'))
  .custom((value) => {
    if (typeof value === 'string') return value === 'true';
    return value;
  });

// ✅ Image schema (in case frontend sends image as JSON URL)
const imageSchema = Joi.object({
  url: Joi.string().allow(null, ''),
  publicId: Joi.string().allow(null, '')
})
  .allow(null)
  .optional();

// ===== CREATE =====
const createMedicine = {
  body: Joi.object({
    name: Joi.string().required().trim().min(2).max(200).messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 200 characters',
      'any.required': 'Name is required'
    }),
    generic: objectId.required().messages({
      'any.required': 'Generic is required'
    }),
    brand: objectId.allow(null, '').optional(),
    category: objectId.required().messages({
      'any.required': 'Category is required'
    }),
    unit: objectId.required().messages({
      'any.required': 'Unit is required'
    }),
    strength: Joi.string().required().trim().max(50).messages({
      'any.required': 'Strength is required'
    }),
    dosageForm: Joi.string().valid(...dosageForms).required().messages({
      'any.only': 'Invalid dosage form',
      'any.required': 'Dosage form is required'
    }),
    barcode: Joi.string().trim().allow(null, '').optional(),
    sku: Joi.string().trim().uppercase().allow(null, '').optional(),
    prescriptionRequired: booleanString.default(false),
    description: Joi.string().trim().max(2000).allow('', null).optional(),
    manufacturer: Joi.string().trim().max(200).allow('', null).optional(),
    storageCondition: Joi.string().trim().max(500).allow('', null).optional(),
    minStockLevel: Joi.number().integer().min(0).default(0),
    status: Joi.string().valid('active', 'inactive').default('active'),
    image: imageSchema // ✅ allow image object
  })
    .unknown(true)
    .options({ stripUnknown: false, convert: true })
};

// ===== UPDATE =====
const updateMedicine = {
  params: Joi.object({
    id: objectId.required()
  }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(200).optional(),
    generic: objectId.optional(),
    brand: objectId.allow(null, '').optional(),
    category: objectId.optional(),
    unit: objectId.optional(),
    strength: Joi.string().trim().max(50).optional(),
    dosageForm: Joi.string().valid(...dosageForms).optional(),
    barcode: Joi.string().trim().allow(null, '').optional(),
    sku: Joi.string().trim().uppercase().allow(null, '').optional(),
    prescriptionRequired: booleanString.optional(),
    description: Joi.string().trim().max(2000).allow('', null).optional(),
    manufacturer: Joi.string().trim().max(200).allow('', null).optional(),
    storageCondition: Joi.string().trim().max(500).allow('', null).optional(),
    minStockLevel: Joi.number().integer().min(0).optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
    image: imageSchema // ✅ allow image object
  })
    .min(1)
    .unknown(true)
    .options({ stripUnknown: false, convert: true })
    .messages({
      'object.min': 'At least one field is required to update'
    })
};

// ===== GET BY ID =====
const getById = {
  params: Joi.object({
    id: objectId.required()
  })
};

// ===== DELETE =====
const remove = {
  params: Joi.object({
    id: objectId.required()
  })
};

// ===== BARCODE =====
const getByBarcode = {
  params: Joi.object({
    code: Joi.string().required()
  })
};

module.exports = {
  createMedicine,
  updateMedicine,
  getById,
  remove,
  getByBarcode
};