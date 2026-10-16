// src/routes/auditLog.routes.js
// AuditLog routes — read only

const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLog.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const validate = require('../middlewares/validate.middleware');

// Sob route protected
router.use(auth);

// Sob route e audit:view permission
router.use(authorize('audit', 'view'));

// Summary (specific — `/:id` er age)
router.get('/summary', auditLogController.getSummary);

// User wise (specific)
router.get('/user/:userId', auditLogController.getByUser);

// List
router.get('/', auditLogController.getAll);

// Get by id
router.get('/:id', auditLogController.getById);

module.exports = router;