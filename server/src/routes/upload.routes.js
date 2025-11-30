const express = require('express');
const router = express.Router();
const multer = require('multer');

// Firebase Admin importieren (wird beim Import initialisiert)
const admin = require('../config/firebase');

// Multer für Memory-Storage (hält Datei im RAM)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max
  }
});

/**
 * Upload file to Firebase Storage
 * POST /api/v1/upload
 */
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Keine Datei hochgeladen'
      });
    }

    const type = req.body.type || 'product';
    
    // Prüfe ob Firebase initialisiert ist
    if (!admin.apps.length) {
      return res.status(500).json({
        success: false,
        message: 'Firebase nicht konfiguriert'
      });
    }

    const bucket = admin.storage().bucket();
    
    // Erstelle eindeutigen Dateinamen
    const timestamp = Date.now();
    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = type === 'thumbnail' 
      ? `thumbnails/${timestamp}_${safeName}`
      : `products/${timestamp}_${safeName}`;

    const file = bucket.file(path);
    
    // Upload Buffer zu Firebase Storage
    await file.save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype
      }
    });

    // Mache Datei öffentlich zugänglich
    await file.makePublic();

    // Generiere öffentliche URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${path}`;

    res.json({
      success: true,
      data: {
        url: publicUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    next(error);
  }
});

module.exports = router;