/**
 * Midtrans Types & Interfaces
 * Centralized type definitions for Midtrans integration
 */

// Midtrans Notification from Webhook
export interface MidtransNotification {
  transaction_time: string;
  transaction_status: string;
  transaction_id: string;
  status_message: string;
  status_code: string;
  signature_key: string;
  payment_type: string;
  order_id: string;
  gross_amount: string;
  fraud_status?: string;
  currency?: string;
  merchant_id?: string;
  masked_card?: string;
  bank?: string;
  va_numbers?: Array<{
    bank: string;
    va_number: string;
  }>;
  bca_va_number?: string;
  permata_va_number?: string;
  settlement_time?: string;
  expiry_time?: string;
  bill_key?: string;
  biller_code?: string;
}

// Snap Payment Result (from client-side callback)
export interface SnapResult {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  merchant_id?: string;
  gross_amount: string;
  currency: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  va_numbers?: Array<{
    bank: string;
    va_number: string;
  }>;
  fraud_status?: string;
  masked_card?: string;
  bank?: string;
  approval_code?: string;
}

// Transaction Status from Midtrans API
export interface MidtransTransactionStatus {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status?: string;
  settlement_time?: string;
  va_numbers?: Array<{
    bank: string;
    va_number: string;
  }>;
}

// Our internal transaction status
export type TransactionStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled' | 'expired';

// Our internal payment status (mirrors Midtrans)
export type PaymentStatus = 'pending' | 'capture' | 'settlement' | 'deny' | 'cancel' | 'expire' | 'failure';

// Required fields for webhook validation
export const REQUIRED_NOTIFICATION_FIELDS = [
  'transaction_status',
  'transaction_id',
  'status_code',
  'signature_key',
  'order_id',
  'gross_amount',
] as const;
