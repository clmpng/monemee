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
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }
      
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
          seller_type: user.seller_type || 'private',
          storeSettings: user.store_settings || { theme: 'classic', layout: { productGrid: 'two-column' } },
          createdAt: user.created_at,
          updatedAt: user.updated_at
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
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }

      const { username, name, bio, avatar_url, store_settings } = req.body;
      
      // Validate username if provided
      if (username !== undefined && username !== null) {
        // Empty string means remove username
        if (username !== '') {
          // Check username format
          if (!/^[a-z0-9_]{3,30}$/.test(username)) {
            return res.status(400).json({
              success: false,
              message: 'Username muss 3-30 Zeichen lang sein und darf nur Kleinbuchstaben, Zahlen und Unterstriche enthalten'
            });
          }
          
          // Check if username is available (excluding current user)
          const existingUser = await UserModel.findByUsername(username);
          if (existingUser && existingUser.id !== userId) {
            return res.status(400).json({
              success: false,
              message: 'Dieser Username ist bereits vergeben'
            });
          }
        }
      }
      
      // Validate name if provided
      if (name !== undefined && name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Name muss mindestens 2 Zeichen haben'
        });
      }
      
      // Validate bio length
      if (bio !== undefined && bio.length > 500) {
        return res.status(400).json({
          success: false,
          message: 'Bio darf maximal 500 Zeichen haben'
        });
      }

      // Validate store_settings
      if (store_settings !== undefined) {
        const ALLOWED_THEMES = ['classic', 'sunset', 'nature', 'dark', 'minimal', 'pastel'];
        const ALLOWED_GRIDS = ['single', 'two-column', 'three-column'];
        const ALLOWED_AVATAR_STYLES = ['round', 'square', 'hexagon'];
        const ALLOWED_BUTTON_STYLES = ['rounded', 'pill', 'sharp'];
        const ALLOWED_CARD_STYLES = ['elevated', 'flat', 'bordered'];
        const ALLOWED_HEADER_BACKGROUNDS = ['solid', 'gradient', 'pattern'];
        const ALLOWED_FONTS = ['modern', 'elegant', 'playful'];
        const ALLOWED_SPACING = ['compact', 'normal', 'spacious'];

        if (store_settings.theme && !ALLOWED_THEMES.includes(store_settings.theme)) {
          return res.status(400).json({
            success: false,
            message: 'Ungültiges Theme'
          });
        }

        if (store_settings.layout?.productGrid && !ALLOWED_GRIDS.includes(store_settings.layout.productGrid)) {
          return res.status(400).json({
            success: false,
            message: 'Ungültiges Grid-Layout'
          });
        }

        if (store_settings.avatarStyle && !ALLOWED_AVATAR_STYLES.includes(store_settings.avatarStyle)) {
          return res.status(400).json({
            success: false,
            message: 'Ungültiger Avatar-Style'
          });
        }

        if (store_settings.buttonStyle && !ALLOWED_BUTTON_STYLES.includes(store_settings.buttonStyle)) {
          return res.status(400).json({
            success: false,
            message: 'Ungültiger Button-Style'
          });
        }

        if (store_settings.cardStyle && !ALLOWED_CARD_STYLES.includes(store_settings.cardStyle)) {
          return res.status(400).json({
            success: false,
            message: 'Ungültiger Card-Style'
          });
        }

        if (store_settings.headerBackground && !ALLOWED_HEADER_BACKGROUNDS.includes(store_settings.headerBackground)) {
          return res.status(400).json({
            success: false,
            message: 'Ungültiger Header-Background'
          });
        }

        if (store_settings.fontFamily && !ALLOWED_FONTS.includes(store_settings.fontFamily)) {
          return res.status(400).json({
            success: false,
            message: 'Ungültige Schriftart'
          });
        }

        if (store_settings.spacing && !ALLOWED_SPACING.includes(store_settings.spacing)) {
          return res.status(400).json({
            success: false,
            message: 'Ungültige Spacing-Option'
          });
        }
      }

      const updateData = {};
      if (username !== undefined) updateData.username = username.toLowerCase() || null;
      if (name !== undefined) updateData.name = name.trim();
      if (bio !== undefined) updateData.bio = bio;
      if (avatar_url !== undefined) updateData.avatar_url = avatar_url || null;
      if (store_settings !== undefined) updateData.store_settings = store_settings;
      
      const user = await UserModel.update(userId, updateData);
      
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
          seller_type: user.seller_type || 'private'
        },
        message: 'Profil aktualisiert'
      });
    } catch (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'Dieser Username ist bereits vergeben'
        });
      }
      next(error);
    }
  },

  /**
   * Update user role
   * PUT /api/v1/users/me/role
   */
  async updateRole(req, res, next) {
    try {
      const userId = req.userId;
      const { role } = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Nicht authentifiziert'
        });
      }
      
      if (!['creator', 'promoter', 'both'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Ungültige Rolle. Erlaubt: creator, promoter, both'
        });
      }
      
      const user = await UserModel.update(userId, { role });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User nicht gefunden'
        });
      }
      
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
   * Check username availability
   * GET /api/v1/users/check-username/:username
   */
  async checkUsername(req, res, next) {
    try {
      const { username } = req.params;
      const currentUserId = req.userId; // May be undefined for unauthenticated requests
      
      if (!username || username.length < 3) {
        return res.json({
          success: true,
          data: { available: false, reason: 'zu kurz' }
        });
      }
      
      if (username.length > 30) {
        return res.json({
          success: true,
          data: { available: false, reason: 'zu lang' }
        });
      }
      
      if (!/^[a-z0-9_]+$/.test(username)) {
        return res.json({
          success: true,
          data: { available: false, reason: 'ungültige Zeichen' }
        });
      }
      
      const existingUser = await UserModel.findByUsername(username);
      
      // Username is available if:
      // - No user has it, OR
      // - The current authenticated user has it (they're checking their own username)
      const isAvailable = !existingUser || (currentUserId && existingUser.id === currentUserId);
      
      res.json({
        success: true,
        data: { 
          available: isAvailable,
          reason: isAvailable ? null : 'bereits vergeben'
        }
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
            level: user.level,
            settings: user.store_settings || { theme: 'classic', layout: { productGrid: 'two-column' } },
            createdAt: user.created_at
          },
          products: activeProducts.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            price: parseFloat(p.price || 0),
            thumbnail: p.thumbnail_url,
            type: p.type,
            views: p.views,
            sales: p.sales,
            commission: p.affiliate_commission
          })),
          productCount: activeProducts.length
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = usersController;
