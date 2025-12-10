const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');

// ============================================
// Products Routes
// ============================================

// Public Routes (no auth required)
// --------------------------------

// GET /api/v1/products/top - Get top/trending products
router.get('/top', productsController.getTopProducts);

// GET /api/v1/products/discover - Discover products (for promoters)
router.get('/discover', optionalAuth, productsController.discoverProducts);

// GET /api/v1/products/public/:id - Get public product (no auth, increments views)
router.get('/public/:id', optionalAuth, productsController.getPublicProduct);

// Protected Routes (require authentication)
// -----------------------------------------

// GET /api/v1/products - Get all products for current user
router.get('/', authenticate, productsController.getMyProducts);

// GET /api/v1/products/:id - Get single product (authenticated)
router.get('/:id', authenticate, productsController.getProduct);

// POST /api/v1/products - Create new product
router.post('/', authenticate, productsController.createProduct);

// PUT /api/v1/products/:id - Update product
router.put('/:id', authenticate, productsController.updateProduct);

// DELETE /api/v1/products/:id - Delete product
router.delete('/:id', authenticate, productsController.deleteProduct);

// Module Routes
// -------------

// PUT /api/v1/products/:id/modules/reorder - Reorder modules (must be before :moduleId)
router.put('/:id/modules/reorder', authenticate, productsController.reorderModules);

// POST /api/v1/products/:id/modules - Add module to product
router.post('/:id/modules', authenticate, productsController.addModule);

// PUT /api/v1/products/:id/modules/:moduleId - Update module
router.put('/:id/modules/:moduleId', authenticate, productsController.updateModule);

// DELETE /api/v1/products/:id/modules/:moduleId - Delete module
router.delete('/:id/modules/:moduleId', authenticate, productsController.deleteModule);

// Legacy route (redirect to new upload endpoint)
router.post('/:id/upload', authenticate, productsController.uploadFile);

module.exports = router;
