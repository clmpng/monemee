const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');

// ============================================
// Users Routes
// ============================================

// GET /api/v1/users/me - Get current user
router.get('/me', usersController.getMe);

// PUT /api/v1/users/me - Update current user
router.put('/me', usersController.updateMe);

// PUT /api/v1/users/me/role - Update user role
router.put('/me/role', usersController.updateRole);

// GET /api/v1/users/:username/store - Get public store
router.get('/:username/store', usersController.getPublicStore);

module.exports = router;