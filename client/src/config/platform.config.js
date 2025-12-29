/**
 * Platform Configuration
 * Zentrale Konfiguration für Level, Payouts und Stripe Status
 * 
 * Diese Datei spiegelt die Backend-Konfiguration wider
 * und wird für UI-Darstellungen verwendet
 */

// ============================================
// LEVEL KONFIGURATION
// ============================================

export const LEVELS = [
  {
    level: 1,
    name: 'Starter',
    minEarnings: 0,
    platformFee: 15,
    color: '#64748B',
    icon: '🌱'
  },
  {
    level: 2,
    name: 'Rising',
    minEarnings: 100,
    platformFee: 12,
    color: '#3B82F6',
    icon: '⭐'
  },
  {
    level: 3,
    name: 'Pro',
    minEarnings: 500,
    platformFee: 10,
    color: '#8B5CF6',
    icon: '💎'
  },
  {
    level: 4,
    name: 'Expert',
    minEarnings: 2000,
    platformFee: 8,
    color: '#F59E0B',
    icon: '🏆'
  },
  {
    level: 5,
    name: 'Legend',
    minEarnings: 5000,
    platformFee: 5,
    color: '#EF4444',
    icon: '👑'
  }
];

export function getLevelByNumber(levelNumber) {
  return LEVELS.find(l => l.level === levelNumber) || LEVELS[0];
}

export function getLevelByEarnings(totalEarnings) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalEarnings >= LEVELS[i].minEarnings) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

export function getNextLevel(currentLevel) {
  const currentIndex = LEVELS.findIndex(l => l.level === currentLevel);
  const nextIndex = currentIndex + 1;
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

// ============================================
// STRIPE CONNECT STATUS
// ============================================

export const STRIPE_STATUS = {
  NOT_CREATED: 'not_created',
  PENDING: 'pending',
  RESTRICTED: 'restricted',
  ENABLED: 'enabled'
};

export const STRIPE_STATUS_LABELS = {
  not_created: 'Nicht eingerichtet',
  pending: 'Einrichtung ausstehend',
  restricted: 'Eingeschränkt',
  enabled: 'Aktiv'
};

export const STRIPE_STATUS_COLORS = {
  not_created: '#64748B',
  pending: '#F59E0B',
  restricted: '#EF4444',
  enabled: '#10B981'
};

export function getStripeStatusLabel(status) {
  return STRIPE_STATUS_LABELS[status] || status;
}

export function getStripeStatusColor(status) {
  return STRIPE_STATUS_COLORS[status] || '#64748B';
}

/**
 * Prüft ob User Auszahlungen anfordern kann
 * Basierend auf Stripe Connect Status
 */
export function canReceivePayouts(stripeStatus) {
  return stripeStatus === STRIPE_STATUS.ENABLED;
}