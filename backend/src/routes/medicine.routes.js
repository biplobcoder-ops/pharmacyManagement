// src/routes/medicine.routes.js
// Medicine routes

const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicine.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const { uploadSingle } = require('../middlewares/upload.middleware');
const { medicineValidation } = require('../validations');

// Sob route protected
router.use(auth);

// ===== Specific routes (age rakhte hobe) =====
router.get('/stats', authorize('medicine', 'view'), medicineController.getStats);

router.get(
  '/barcode/:code',
  authorize('medicine', 'view'),
  validate(medicineValidation.getByBarcode),
  medicineController.getByBarcode
);

router.post(
  '/:id/image',
  authorize('medicine', 'update'),
  uploadSingle,
  medicineController.uploadImage
);

router.delete(
  '/:id/image',
  authorize('medicine', 'update'),
  medicineController.deleteImage
);

// ===== Main routes =====
router
  .route('/')
  .get(authorize('medicine', 'view'), medicineController.getAll)
  .post(
    authorize('medicine', 'create'),
    uploadSingle, // ✅ multer FIRST
    validate(medicineValidation.createMedicine), // ✅ validate SECOND
    medicineController.create
  );

router
  .route('/:id')
  .get(
    authorize('medicine', 'view'),
    validate(medicineValidation.getById),
    medicineController.getById
  )
  .patch(
    authorize('medicine', 'update'),
    uploadSingle, // ✅ multer FIRST
    validate(medicineValidation.updateMedicine), // ✅ validate SECOND
    medicineController.update
  )
  .delete(
    authorize('medicine', 'delete'),
    validate(medicineValidation.remove),
    medicineController.remove
  );

module.exports = router;