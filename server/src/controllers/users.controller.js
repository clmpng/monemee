const UserModel = require('../models/User.model');
const ProductModel = require('../models/Product.model');

/**
 * Users Controller
 * Handles user-related HTTP requests
 */
const usersController = {
  /**
   * Get current user profile
   * GET /api/v1/users/me
   */
  async getMe(req, res, next) {
    try {
      const userId = req.userId || 1;
      
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User nicht gefunden'
        });
      }
      
      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          bio: user.bio,
          avatar: user.avatar_url,
          role: user.role,
          level: user.level,
          totalEarnings: parseFloat(user.total_earnings || 0),
          createdAt: user.created_at
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update current user profile
   * PUT /api/v1/users/me
   */
  async updateMe(req, res, next) {
    try {
      const userId = req.userId || 1;
      const { username, name, bio, avatar_url } = req.body;
      
      const user = await UserModel.update(userId, {
        username,
        name,
        bio,
        avatar_url
      });
      
      res.json({
        success: true,
        data: user,
        message: 'Profil aktualisiert'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update user role
   * PUT /api/v1/users/me/role
   */
  async updateRole(req, res, next) {
    try {
      const userId = req.userId || 1;
      const { role } = req.body;
      
      if (!['creator', 'promoter', 'both'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Ungültige Rolle'
        });
      }
      
      const user = await UserModel.update(userId, { role });
      
      res.json({
        success: true,
        data: { role: user.role },
        message: 'Rolle aktualisiert'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get public store by username
   * GET /api/v1/users/:username/store
   */
  async getPublicStore(req, res, next) {
    try {
      const { username } = req.params;
      
      const user = await UserModel.findByUsername(username);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Store nicht gefunden'
        });
      }
      
      const products = await ProductModel.findByUserId(user.id);
      const activeProducts = products.filter(p => p.status === 'active');
      
      res.json({
        success: true,
        data: {
          store: {
            username: user.username,
            name: user.name,
            bio: user.bio,
            avatar: user.avatar_url,
            level: user.level
          },
          products: activeProducts.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            price: parseFloat(p.price || 0),
            thumbnail: p.thumbnail_url,
            type: p.type,
            commission: p.affiliate_commission
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = usersController;