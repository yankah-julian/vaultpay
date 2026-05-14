interface TransactionContext {
  account_id: string;
  amount: number;
  currency: string;
  ip_address?: string;
  device_fingerprint?: string;
}

interface FraudScore {
  score: number;        // 0-100, higher = more risky
  flags: string[];
  action: 'allow' | 'review' | 'block';
}

/**
 * Lightweight ML-inspired fraud scoring.
 * In production: replace with a trained gradient boosted model.
 */
export async function scoreFraud(tx: TransactionContext): Promise<FraudScore> {
  const flags: string[] = [];
  let score = 0;

  // Velocity check — high amount
  if (tx.amount > 10000) {
    score += 30;
    flags.push('HIGH_AMOUNT');
  }

  // Cross-currency risk
  if (tx.currency !== 'USD') {
    score += 10;
    flags.push('FOREIGN_CURRENCY');
  }

  // No device fingerprint = higher risk
  if (!tx.device_fingerprint) {
    score += 15;
    flags.push('NO_DEVICE_FINGERPRINT');
  }

  // Determine action
  let action: FraudScore['action'] = 'allow';
  if (score >= 70) action = 'block';
  else if (score >= 40) action = 'review';

  return { score, flags, action };
}
