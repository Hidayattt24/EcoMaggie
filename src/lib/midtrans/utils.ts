/**
 * Midtrans Utility Functions
 * Helper functions for Midtrans integration
 */

import crypto from 'crypto';
import type { MidtransNotification, TransactionStatus, PaymentStatus, REQUIRED_NOTIFICATION_FIELDS } from './types';

/**
 * Get Midtrans API URLs based on environment
 */
export function getMidtransUrls() {
  const isProduction = process.env.MIDTRANS_ENVIRONMENT === 'production';
  
  return {
    snap: isProduction 
      ? 'https://app.midtrans.com' 
      : 'https://app.sandbox.midtrans.com',
    core: isProduction 
      ? 'https://api.midtrans.com' 
      : 'https://api.sandbox.midtrans.com',
  };
}

/**
 * Create Authorization header for Midtrans API
 */
export function getAuthHeader(): string {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    throw new Error('MIDTRANS_SERVER_KEY is not configured');
  }
  return `Basic ${Buffer.from(`${serverKey}:`).toString('base64')}`;
}

/**
 * Verify Midtrans webhook signature
 * Formula: SHA512(order_id + status_code + gross_amount + server_key)
 */
export function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    console.error('❌ MIDTRANS_SERVER_KEY not configured');
    return false;
  }

  const payload = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const computedSignature = crypto
    .createHash('sha512')
    .update(payload)
    .digest('hex');

  const isValid = computedSignature === signatureKey;
  
  if (!isValid) {
    console.error('❌ Signature mismatch:');
    console.error('   Computed:', computedSignature.substring(0, 20) + '...');
    console.error('   Received:', signatureKey.substring(0, 20) + '...');
  }

  return isValid;
}

/**
 * Validate notification payload has all required fields
 */
export function validateNotification(notification: any): MidtransNotification | null {
  const requiredFields: readonly string[] = [
    'transaction_status',
    'transaction_id', 
    'status_code',
    'signature_key',
    'order_id',
    'gross_amount',
  ];

  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (!notification[field]) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    console.error('❌ Missing required fields in notification:', missingFields);
    return null;
  }

  return notification as MidtransNotification;
}

/**
 * Map Midtrans transaction_status to our internal status
 * IMPORTANT: Check fraud_status FIRST before transaction_status
 */
export function mapMidtransStatus(
  transactionStatus: string,
  fraudStatus?: string
): { transactionStatus: TransactionStatus; paymentStatus: PaymentStatus } {
  
  // Handle fraud status FIRST (like teman's code)
  if (fraudStatus === 'challenge') {
    console.log('⚠️ Transaction challenged by fraud detection');
    return { transactionStatus: 'pending', paymentStatus: 'pending' };
  }
  
  if (fraudStatus === 'deny') {
    console.log('❌ Transaction denied by fraud detection');
    return { transactionStatus: 'failed', paymentStatus: 'deny' };
  }

  // Then handle transaction status
  switch (transactionStatus) {
    case 'capture':
      // For credit card with fraudStatus === 'accept'
      return { transactionStatus: 'paid', paymentStatus: 'capture' };
      
    case 'settlement':
      return { transactionStatus: 'paid', paymentStatus: 'settlement' };
      
    case 'pending':
      return { transactionStatus: 'pending', paymentStatus: 'pending' };
      
    case 'deny':
      return { transactionStatus: 'failed', paymentStatus: 'deny' };
      
    case 'cancel':
      return { transactionStatus: 'cancelled', paymentStatus: 'cancel' };
      
    case 'expire':
      return { transactionStatus: 'expired', paymentStatus: 'expire' };
      
    case 'failure':
      return { transactionStatus: 'failed', paymentStatus: 'failure' };
      
    default:
      console.warn(`⚠️ Unknown Midtrans status: ${transactionStatus}`);
      return { transactionStatus: 'pending', paymentStatus: 'pending' };
  }
}

/**
 * Normalize order_id (trim whitespace, handle encoding issues)
 */
export function normalizeOrderId(orderId: string): string {
  if (!orderId) return '';
  
  return orderId
    .trim()
    .replace(/\s+/g, '') // Remove all whitespace
    .toUpperCase(); // Normalize case (optional, depends on your format)
}

/**
 * Format amount for Midtrans (integer, no decimal)
 */
export function formatAmount(amount: number): number {
  return Math.round(amount);
}

/**
 * Check if transaction status indicates payment is complete
 */
export function isPaymentComplete(status: string): boolean {
  return ['settlement', 'capture'].includes(status);
}

/**
 * Check if transaction status indicates payment failed/cancelled
 */
export function isPaymentFailed(status: string): boolean {
  return ['deny', 'cancel', 'expire', 'failure'].includes(status);
}
