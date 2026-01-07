const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Firebase Admin importieren (wird beim Import initialisiert)
const admin = require('../config/firebase');

// Auth Middleware importieren
const { authenticate } = require('../middleware/auth');

// ============================================
// Erlaubte Dateitypen (Security)
// ============================================

// Thumbnails: Nur Bilder
const ALLOWED_THUMBNAIL_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

const ALLOWED_THUMBNAIL_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// Produkt-Dateien: Bilder, PDFs, ZIPs, gängige Dokumente
const ALLOWED_PRODUCT_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/epub+zip',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/mp3'
];

const ALLOWED_PRODUCT_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp',
  '.pdf', '.zip', '.epub',
  '.mp4', '.webm', '.mp3'
];

// Explizit verbotene Dateitypen (Security-kritisch)
const FORBIDDEN_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.bash',
  '.php', '.asp', '.aspx', '.jsp', '.cgi',
  '.html', '.htm', '.js', '.mjs',
  '.dll', '.so', '.dylib',
  '.ps1', '.vbs', '.wsf'
];

/**
 * Dateityp-Validierung
 */
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const uploadType = req.body.type || 'product';

  // Explizit verbotene Dateitypen ablehnen
  if (FORBIDDEN_EXTENSIONS.includes(ext)) {
    return cb(new Error(`Dateityp ${ext} ist nicht erlaubt`), false);
  }

  // Je nach Upload-Typ verschiedene Dateien erlauben
  if (uploadType === 'thumbnail') {
    if (!ALLOWED_THUMBNAIL_MIMETYPES.includes(file.mimetype) ||
        !ALLOWED_THUMBNAIL_EXTENSIONS.includes(ext)) {
      return cb(new Error('Nur Bilder (JPG, PNG, GIF, WebP) für Thumbnails erlaubt'), false);
    }
  } else {
    if (!ALLOWED_PRODUCT_MIMETYPES.includes(file.mimetype) ||
        !ALLOWED_PRODUCT_EXTENSIONS.includes(ext)) {
      return cb(new Error('Dieser Dateityp ist nicht erlaubt'), false);
    }
  }

  cb(null, true);
};

// Multer für Memory-Storage (hält Datei im RAM)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max
  },
  fileFilter: fileFilter
});

/**
 * Upload file to Firebase Storage
 * POST /api/v1/upload
 *
 * SECURITY: Erfordert Authentifizierung + Dateityp-Validierung
 */
router.post('/', authenticate, upload.single('file'), async (req, res, next) => {
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

/**
 * Error Handler für Multer-Fehler
 * Gibt benutzerfreundliche Fehlermeldungen zurück
 */
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Datei zu groß. Maximal 100MB erlaubt.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload-Fehler: ${error.message}`
    });
  }

  // Fehler aus fileFilter
  if (error.message && error.message.includes('nicht erlaubt')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
});

module.exports = router;