const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const sellerBillingController = require('../controllers/sellerBilling.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');

// ============================================
// Users Routes
// ============================================

// Protected Routes (require authentication)
// -----------------------------------------

// GET /api/v1/users/me - Get current user profile
router.get('/me', authenticate, usersController.getMe);

// PUT /api/v1/users/me - Update current user profile
router.put('/me', authenticate, usersController.updateMe);

// DELETE /api/v1/users/me - Delete current user account
router.delete('/me', authenticate, usersController.deleteAccount);

// PUT /api/v1/users/me/role - Update user role
router.put('/me/role', authenticate, usersController.updateRole);

// Public Routes (authentication optional or not required)
// -------------------------------------------------------

// GET /api/v1/users/check-username/:username - Check if username is available
// Uses optionalAuth so we can check if user is checking their own username
router.get('/check-username/:username', optionalAuth, usersController.checkUsername);

// GET /api/v1/users/:username/store - Get public store by username
router.get('/:username/store', optionalAuth, usersController.getPublicStore);

// Billing Info
router.get('/billing', authenticate, sellerBillingController.getBillingInfo);
router.put('/billing', authenticate, sellerBillingController.updateBillingInfo);
router.put('/seller-type', authenticate, sellerBillingController.setSellerType);
router.get('/can-sell', authenticate, sellerBillingController.checkCanSell);

module.exports = router;
