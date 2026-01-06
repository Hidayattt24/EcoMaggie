/**
 * Midtrans Integration Module
 * 
 * Usage:
 * // Server-side
 * import { midtransService } from '@/lib/midtrans';
 * import { verifySignature, mapMidtransStatus } from '@/lib/midtrans';
 * 
 * // Client-side
 * import { snapClient } from '@/lib/midtrans/snap-client';
 * await snapClient.pay(snapToken, { onSuccess: ... });
 */

// Service (server-side)
export { midtransService, MidtransService } from './service';

// Utilities
export {
  getMidtransUrls,
  getAuthHeader,
  verifySignature,
  validateNotification,
  mapMidtransStatus,
  normalizeOrderId,
  formatAmount,
  isPaymentComplete,
  isPaymentFailed,
} from './utils';

// Types
export type {
  MidtransNotification,
  MidtransTransactionStatus,
  SnapResult,
  TransactionStatus,
  PaymentStatus,
} from './types';

export { REQUIRED_NOTIFICATION_FIELDS } from './types';

// Note: snapClient is exported from './snap-client' separately
// to avoid "use client" directive issues
