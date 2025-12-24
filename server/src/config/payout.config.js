/**
 * Payout Configuration - Single Source of Truth
 * 
 * Alle Auszahlungs-Regeln zentral definiert.
 * Änderungen hier gelten automatisch überall.
 */

const PAYOUT_CONFIG = {
  // Mindestbetrag für kostenlose Auszahlung
  minFreePayoutAmount: 50,
  
  // Gebühr für Auszahlungen unter Mindestbetrag
  smallPayoutFee: 1,
  
  // Absoluter Mindestbetrag für Auszahlung (nach Abzug Gebühr)
  absoluteMinPayout: 5,
  
  // Bearbeitungszeit in Tagen (für Anzeige)
  processingDays: 3,
  
  // Status-Definitionen
  statuses: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
  },
  
  // Status-Labels für UI
  statusLabels: {
    pending: 'Ausstehend',
    processing: 'In Bearbeitung',
    completed: 'Ausgezahlt',
    failed: 'Fehlgeschlagen',
    cancelled: 'Storniert'
  },
  
  // Status-Farben für UI
  statusColors: {
    pending: '#F59E0B',
    processing: '#3B82F6',
    completed: '#10B981',
    failed: '#EF4444',
    cancelled: '#64748B'
  }
};

/**
 * Berechnet die Auszahlungsgebühr
 */
function calculatePayoutFee(amount) {
  if (amount >= PAYOUT_CONFIG.minFreePayoutAmount) {
    return 0;
  }
  return PAYOUT_CONFIG.smallPayoutFee;
}

/**
 * Berechnet den Nettobetrag nach Gebühr
 */
function calculateNetPayout(amount) {
  const fee = calculatePayoutFee(amount);
  return Math.max(amount - fee, 0);
}

/**
 * Prüft ob Auszahlung möglich ist
 */
function canRequestPayout(availableBalance, requestedAmount) {
  if (requestedAmount <= 0) {
    return { allowed: false, reason: 'Betrag muss größer als 0 sein' };
  }
  
  if (requestedAmount > availableBalance) {
    return { allowed: false, reason: 'Nicht genügend Guthaben verfügbar' };
  }
  
  const netAmount = calculateNetPayout(requestedAmount);
  if (netAmount < PAYOUT_CONFIG.absoluteMinPayout) {
    return { 
      allowed: false, 
      reason: `Mindestbetrag nach Gebühren: ${PAYOUT_CONFIG.absoluteMinPayout}€` 
    };
  }
  
  return { allowed: true };
}

/**
 * Formatiert Status für Anzeige
 */
function getStatusLabel(status) {
  return PAYOUT_CONFIG.statusLabels[status] || status;
}

/**
 * Gibt Statusfarbe zurück
 */
function getStatusColor(status) {
  return PAYOUT_CONFIG.statusColors[status] || '#64748B';
}

module.exports = {
  PAYOUT_CONFIG,
  calculatePayoutFee,
  calculateNetPayout,
  canRequestPayout,
  getStatusLabel,
  getStatusColor
};
