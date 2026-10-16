// src/routes/search.routes.js

const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');
const auth = require('../middlewares/auth.middleware');

// Sob route protected
router.use(auth);

// GET /api/search?q=napa
router.get('/', searchController.globalSearch);

module.exports = router;