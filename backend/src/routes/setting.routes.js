// src/routes/setting.routes.js
// Setting routes

const express = require('express');
const router = express.Router();
const settingController = require('../controllers/setting.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');
const { settingValidation } = require('../validations');

// Sob route protected
router.use(auth);

// Category wise (specific — `/:key` er age)
router.get(
  '/category/:category',
  authorize('setting', 'view'),
  validate(settingValidation.getByCategory),
  settingController.getByCategory
);

// Bulk update (specific — `/:key` er age)
router.patch(
  '/bulk',
  authorize('setting', 'update'),
  validate(settingValidation.bulkUpdate),
  settingController.bulkUpdate
);

// List + Create
router
  .route('/')
  .get(authorize('setting', 'view'), settingController.getAll)
  .post(
    authorize('setting', 'update'),
    validate(settingValidation.createSetting),
    settingController.create
  );

// Get by key + Update + Delete
router
  .route('/:key')
  .get(
    authorize('setting', 'view'),
    validate(settingValidation.getByKey),
    settingController.getByKey
  )
  .patch(
    authorize('setting', 'update'),
    validate(settingValidation.updateByKey),
    settingController.updateByKey
  )
  .delete(
    authorize('setting', 'update'),
    validate(settingValidation.remove),
    settingController.remove
  );

module.exports = router;