const ProductModel = require('../models/Product.model');

/**
 * Products Controller
 * Handles all product-related HTTP requests
 */
const productsController = {
  /**
   * Get all products for current user
   * GET /api/v1/products
   */
  async getMyProducts(req, res, next) {
    try {
      // TODO: Get user ID from auth middleware
      const userId = req.userId || 1;
      
      const products = await ProductModel.findByUserId(userId);
      
      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get single product by ID
   * GET /api/v1/products/:id
   */
  async getProduct(req, res, next) {
    try {
      const { id } = req.params;
      const product = await ProductModel.findById(id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produkt nicht gefunden'
        });
      }
      
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new product
   * POST /api/v1/products
   */
  async createProduct(req, res, next) {
    try {
      const userId = req.userId || 1;
      const productData = {
        ...req.body,
        user_id: userId
      };
      
      const product = await ProductModel.create(productData);
      
      res.status(201).json({
        success: true,
        data: product,
        message: 'Produkt erstellt'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update product
   * PUT /api/v1/products/:id
   */
  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const product = await ProductModel.update(id, updateData);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produkt nicht gefunden'
        });
      }
      
      res.json({
        success: true,
        data: product,
        message: 'Produkt aktualisiert'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete product
   * DELETE /api/v1/products/:id
   */
  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      
      const deleted = await ProductModel.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Produkt nicht gefunden'
        });
      }
      
      res.json({
        success: true,
        message: 'Produkt gelöscht'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Upload product file
   * POST /api/v1/products/:id/upload
   */
  async uploadFile(req, res, next) {
    try {
      // TODO: Implement file upload to Firebase Storage
      res.json({
        success: true,
        message: 'File upload not implemented yet'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get top/trending products
   * GET /api/v1/products/top
   */
  async getTopProducts(req, res, next) {
    try {
      const products = await ProductModel.getTop(10);
      
      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Discover products (for promoters)
   * GET /api/v1/products/discover
   */
  async discoverProducts(req, res, next) {
    try {
      const { category, sort, limit = 20, offset = 0 } = req.query;
      
      const products = await ProductModel.discover({
        category,
        sort,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get public product (no auth required)
   * Increments view counter
   * GET /api/v1/products/public/:id
   */
  async getPublicProduct(req, res, next) {
    try {
      const { id } = req.params;
      
      // Get product with creator info
      const product = await ProductModel.findByIdPublic(id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produkt nicht gefunden'
        });
      }
      
      // Only show active products publicly
      if (product.status !== 'active') {
        return res.status(404).json({
          success: false,
          message: 'Produkt nicht verfügbar'
        });
      }
      
      // Increment view counter (async, don't wait)
      ProductModel.incrementViews(id).catch(console.error);
      
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = productsController;