// src/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { authValidation } = require('../validations');

router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', auth, authController.logout);
router.post('/refresh', validate(authValidation.refresh), authController.refresh);
router.get('/me', auth, authController.getMe);
router.patch('/change-password', auth, validate(authValidation.changePassword), authController.changePassword);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);

module.exports = router;