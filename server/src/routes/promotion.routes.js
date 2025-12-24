const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotion.controller');
const { authenticate } = require('../middleware/auth');

// ============================================
// Promotion / Affiliate Routes
// ============================================

// POST /api/v1/promotion/generate-link - Generate affiliate link
router.post('/generate-link', authenticate, promotionController.generateLink);

// GET /api/v1/promotion/my-promotions - Get my promoted products
router.get('/my-promotions', authenticate, promotionController.getMyPromotions);

// GET /api/v1/promotion/my-network - Get my promoter network
router.get('/my-network', authenticate, promotionController.getMyNetwork);

// POST /api/v1/promotion/invite - Invite promoter
router.post('/invite', promotionController.invite);

// Public Route (tracking)
router.post('/track-click', promotionController.trackClick);


module.exports = router;