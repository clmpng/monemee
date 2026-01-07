const ProductModel = require('../models/Product.model');
const ProductModuleModel = require('../models/ProductModule.model');

// Mindestpreis für kostenpflichtige Produkte (wegen Stripe-Gebühren)
const MIN_PRICE = 2.99;

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
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }
      
      const products = await ProductModel.findByUserId(userId);
      
      // Lade Module für jedes Produkt
      const productsWithModules = await Promise.all(
        products.map(async (product) => {
          const modules = await ProductModuleModel.findByProductId(product.id);
          return { ...product, modules };
        })
      );
      
      res.json({
        success: true,
        data: productsWithModules
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get single product by ID
   * GET /api/v1/products/:id
   *
   * SECURITY: User kann nur eigene Produkte vollständig abrufen.
   * Fremde Produkte nur wenn status === 'active'
   */
  async getProduct(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const product = await ProductModel.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produkt nicht gefunden'
        });
      }

      // SECURITY: Prüfe ob User Zugriff hat
      const isOwner = product.user_id === userId;

      // Fremde Produkte nur wenn aktiv (öffentlich)
      if (!isOwner && product.status !== 'active') {
        return res.status(404).json({
          success: false,
          message: 'Produkt nicht gefunden'
        });
      }

      // Lade Module
      const modules = await ProductModuleModel.findByProductId(id);

      // Bei fremden Produkten: Keine sensitiven Daten zurückgeben
      if (!isOwner) {
        return res.json({
          success: true,
          data: {
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price,
            thumbnail_url: product.thumbnail_url,
            type: product.type,
            status: product.status,
            views: product.views,
            sales: product.sales,
            affiliate_commission: product.affiliate_commission,
            creator_username: product.creator_username,
            creator_name: product.creator_name,
            modules: modules
          }
        });
      }

      res.json({
        success: true,
        data: { ...product, modules }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new product with modules
   * POST /api/v1/products
   */
  async createProduct(req, res, next) {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }

      const { modules, ...productData } = req.body;
      
      // Mindestpreis-Validierung (nur für kostenpflichtige Produkte)
      const price = parseFloat(productData.price);
      if (price > 0 && price < MIN_PRICE) {
        return res.status(400).json({
          success: false,
          message: `Mindestpreis für kostenpflichtige Produkte: ${MIN_PRICE.toFixed(2).replace('.', ',')} €`
        });
      }
      
      // Erstelle Produkt
      const product = await ProductModel.create({
        ...productData,
        user_id: userId
      });
      
      // Erstelle Module falls vorhanden
      let createdModules = [];
      if (modules && modules.length > 0) {
        createdModules = await ProductModuleModel.createMany(product.id, modules);
      }
      
      res.status(201).json({
        success: true,
        data: { ...product, modules: createdModules },
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
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }

      const { modules, ...updateData } = req.body;
      
      // Prüfe ob Produkt dem User gehört
      const existingProduct = await ProductModel.findById(id);
      if (!existingProduct || existingProduct.user_id !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Produkt nicht gefunden'
        });
      }
      
      // Mindestpreis-Validierung (nur wenn Preis geändert wird)
      if (updateData.price !== undefined) {
        const price = parseFloat(updateData.price);
        if (price > 0 && price < MIN_PRICE) {
          return res.status(400).json({
            success: false,
            message: `Mindestpreis für kostenpflichtige Produkte: ${MIN_PRICE.toFixed(2).replace('.', ',')} €`
          });
        }
      }
      
      // Update Produkt
      const product = await ProductModel.update(id, updateData);
      
      // Update Module falls mitgesendet
      let updatedModules = [];
      if (modules !== undefined) {
        // Lösche alle bestehenden Module
        await ProductModuleModel.deleteByProductId(id);
        
        // Erstelle neue Module
        if (modules && modules.length > 0) {
          updatedModules = await ProductModuleModel.createMany(id, modules);
        }
      } else {
        // Lade bestehende Module
        updatedModules = await ProductModuleModel.findByProductId(id);
      }
      
      res.json({
        success: true,
        data: { ...product, modules: updatedModules },
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
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }

      // Prüfe ob Produkt dem User gehört
      const existingProduct = await ProductModel.findById(id);
      if (!existingProduct || existingProduct.user_id !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Produkt nicht gefunden'
        });
      }
      
      // Module werden durch CASCADE automatisch gelöscht
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
      res.json({
        success: true,
        message: 'Use /api/v1/upload instead'
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
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10)
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
   * Get public product (no auth, increments views)
   * GET /api/v1/products/public/:id
   */
  async getPublicProduct(req, res, next) {
    try {
      const { id } = req.params;
      
      const product = await ProductModel.findByIdPublic(id);
      
      if (!product || product.status !== 'active') {
        return res.status(404).json({
          success: false,
          message: 'Produkt nicht gefunden'
        });
      }
      
      // Increment views
      await ProductModel.incrementViews(id);
      
      // Lade Module
      const modules = await ProductModuleModel.findByProductId(id);
      
      res.json({
        success: true,
        data: { ...product, modules }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Add module to product
   * POST /api/v1/products/:id/modules
   */
  async addModule(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }

      // Prüfe ob Produkt dem User gehört
      const product = await ProductModel.findById(id);
      if (!product || product.user_id !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Produkt nicht gefunden'
        });
      }

      const moduleData = {
        ...req.body,
        product_id: id
      };

      const module = await ProductModuleModel.create(moduleData);
      
      res.status(201).json({
        success: true,
        data: module,
        message: 'Modul hinzugefügt'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update module
   * PUT /api/v1/products/:id/modules/:moduleId
   */
  async updateModule(req, res, next) {
    try {
      const { id, moduleId } = req.params;
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }

      // Prüfe ob Produkt dem User gehört
      const product = await ProductModel.findById(id);
      if (!product || product.user_id !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Produkt nicht gefunden'
        });
      }

      const module = await ProductModuleModel.update(moduleId, req.body);
      
      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Modul nicht gefunden'
        });
      }
      
      res.json({
        success: true,
        data: module,
        message: 'Modul aktualisiert'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete module
   * DELETE /api/v1/products/:id/modules/:moduleId
   */
  async deleteModule(req, res, next) {
    try {
      const { id, moduleId } = req.params;
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }

      // Prüfe ob Produkt dem User gehört
      const product = await ProductModel.findById(id);
      if (!product || product.user_id !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Produkt nicht gefunden'
        });
      }

      const deleted = await ProductModuleModel.delete(moduleId);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Modul nicht gefunden'
        });
      }
      
      res.json({
        success: true,
        message: 'Modul gelöscht'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Reorder modules
   * PUT /api/v1/products/:id/modules/reorder
   */
  async reorderModules(req, res, next) {
    try {
      const { id } = req.params;
      const { moduleIds } = req.body;
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }

      // Prüfe ob Produkt dem User gehört
      const product = await ProductModel.findById(id);
      if (!product || product.user_id !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Produkt nicht gefunden'
        });
      }

      const modules = await ProductModuleModel.reorder(id, moduleIds);
      
      res.json({
        success: true,
        data: modules,
        message: 'Module neu sortiert'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = productsController;
