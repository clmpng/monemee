const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');

/**
 * Reports Routes
 * DSA Art. 16 - Melde- und Abhilfeverfahren
 */

// Öffentliche Endpoints (kein Auth erforderlich)

// Meldung einreichen
router.post('/', reportsController.submitReport);

// Status einer Meldung abfragen (mit E-Mail-Verifikation)
router.get('/:reportId/status', reportsController.getReportStatus);

// Admin-Endpoints (für mission-control)
// Diese werden typischerweise über mission-control aufgerufen
// und haben dort eigene Auth-Middleware

// Alle Meldungen abrufen
router.get('/', reportsController.getAllReports);

// Statistiken abrufen
router.get('/statistics', reportsController.getStatistics);

// Einzelne Meldung abrufen
router.get('/:id', reportsController.getReport);

// Meldung aktualisieren (Status ändern, etc.)
router.patch('/:id', reportsController.updateReport);

module.exports = router;
