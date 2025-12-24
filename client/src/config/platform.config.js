/**
 * Level & Payout Configuration - Client Side
 * 
 * Diese Datei spiegelt die Server-Konfiguration wider.
 * Bei Änderungen an den Werten muss auch die Server-Config angepasst werden.
 * 
 * HINWEIS: In Zukunft können diese Werte auch per API geladen werden,
 * um eine echte Single Source of Truth zu haben.
 */

// ============================================
// LEVEL KONFIGURATION
// ============================================
export const LEVELS = [
  {
    level: 1,
    name: 'Starter',
    minEarnings: 0,
    fee: 15,
    color: '#64748B',
    description: 'Dein Einstieg als Creator'
  },
  {
    level: 2,
    name: 'Rising Star',
    minEarnings: 100,
    fee: 12,
    color: '#3B82F6',
    description: 'Du hast deine ersten Verkäufe gemacht'
  },
  {
    level: 3,
    name: 'Creator',
    minEarnings: 500,
    fee: 10,
    color: '#8B5CF6',
    description: 'Du bist ein etablierter Creator'
  },
  {
    level: 4,
    name: 'Pro',
    minEarnings: 2000,
    fee: 8,
    color: '#F59E0B',
    description: 'Du gehörst zu den Top-Verkäufern'
  },
  {
    level: 5,
    name: 'Elite',
    minEarnings: 5000,
    fee: 5,
    color: '#10B981',
    description: 'Die höchste Stufe - maximale Vorteile'
  }
];

export function getLevelByNumber(levelNumber) {
  return LEVELS.find(l => l.level === levelNumber) || LEVELS[0];
}

export function getNextLevel(currentLevelNumber) {
  const nextIndex = LEVELS.findIndex(l => l.level === currentLevelNumber) + 1;
  return nextIndex < LEVELS.length ? LEVELS[nextIndex] : null;
}

// ============================================
// PAYOUT KONFIGURATION
// ============================================
export const PAYOUT_CONFIG = {
  minFreePayoutAmount: 50,
  smallPayoutFee: 1,
  absoluteMinPayout: 5,
  processingDays: 3,
  
  statuses: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
  },
  
  statusLabels: {
    pending: 'Ausstehend',
    processing: 'In Bearbeitung',
    completed: 'Ausgezahlt',
    failed: 'Fehlgeschlagen',
    cancelled: 'Storniert'
  },
  
  statusColors: {
    pending: '#F59E0B',
    processing: '#3B82F6',
    completed: '#10B981',
    failed: '#EF4444',
    cancelled: '#64748B'
  }
};

export function calculatePayoutFee(amount) {
  if (amount >= PAYOUT_CONFIG.minFreePayoutAmount) {
    return 0;
  }
  return PAYOUT_CONFIG.smallPayoutFee;
}

export function calculateNetPayout(amount) {
  const fee = calculatePayoutFee(amount);
  return Math.max(amount - fee, 0);
}

export function canRequestPayout(availableBalance, requestedAmount) {
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

export function getStatusLabel(status) {
  return PAYOUT_CONFIG.statusLabels[status] || status;
}

export function getStatusColor(status) {
  return PAYOUT_CONFIG.statusColors[status] || '#64748B';
}
