const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotion.controller');

// ============================================
// Promotion / Affiliate Routes
// ============================================

// POST /api/v1/promotion/generate-link - Generate affiliate link
router.post('/generate-link', promotionController.generateLink);

// GET /api/v1/promotion/my-promotions - Get my promoted products
router.get('/my-promotions', promotionController.getMyPromotions);

// GET /api/v1/promotion/my-network - Get my promoter network
router.get('/my-network', promotionController.getMyNetwork);

// POST /api/v1/promotion/track-click - Track affiliate click
router.post('/track-click', promotionController.trackClick);

// POST /api/v1/promotion/invite - Invite promoter
router.post('/invite', promotionController.invite);

module.exports = router;