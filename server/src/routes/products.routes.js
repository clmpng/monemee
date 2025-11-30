const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.controller');
// const { authenticate } = require('../middleware/auth');

// ============================================
// Products Routes
// ============================================

// GET /api/v1/products - Get all products for current user
router.get('/', productsController.getMyProducts);

// GET /api/v1/products/top - Get top/trending products
router.get('/top', productsController.getTopProducts);

// GET /api/v1/products/discover - Discover products (for promoters)
router.get('/discover', productsController.discoverProducts);

// GET /api/v1/products/:id - Get single product
router.get('/:id', productsController.getProduct);

// POST /api/v1/products - Create new product
router.post('/', productsController.createProduct);

// PUT /api/v1/products/:id - Update product
router.put('/:id', productsController.updateProduct);

// DELETE /api/v1/products/:id - Delete product
router.delete('/:id', productsController.deleteProduct);

// POST /api/v1/products/:id/upload - Upload product file
router.post('/:id/upload', productsController.uploadFile);

module.exports = router;