/**
 * Midtrans Service - Server-side API interactions
 * Handles all communication with Midtrans API
 */

import { getMidtransUrls, getAuthHeader, verifySignature, validateNotification, mapMidtransStatus, normalizeOrderId } from './utils';
import type { MidtransNotification, MidtransTransactionStatus } from './types';

export class MidtransService {
  private urls = getMidtransUrls();

  /**
   * Create Snap token for payment
   */
  async createSnapToken(params: {
    orderId: string;
    grossAmount: number;
    customerDetails: {
      firstName: string;
      lastName?: string;
      email: string;
      phone: string;
    };
    itemDetails: Array<{
      id: string;
      price: number;
      quantity: number;
      name: string;
    }>;
    shippingAddress?: {
      firstName: string;
      lastName?: string;
      phone: string;
      address: string;
      city: string;
      postalCode: string;
    };
    callbacks?: {
      finish?: string;
      error?: string;
      pending?: string;
    };
  }): Promise<{ token: string; redirectUrl: string }> {
    const url = `${this.urls.snap}/snap/v1/transactions`;

    const payload = {
      transaction_details: {
        order_id: params.orderId,
        gross_amount: Math.round(params.grossAmount),
      },
      customer_details: {
        first_name: params.customerDetails.firstName,
        last_name: params.customerDetails.lastName || '',
        email: params.customerDetails.email,
        phone: params.customerDetails.phone,
        ...(params.shippingAddress && {
          shipping_address: {
            first_name: params.shippingAddress.firstName,
            last_name: params.shippingAddress.lastName || '',
            phone: params.shippingAddress.phone,
            address: params.shippingAddress.address,
            city: params.shippingAddress.city,
            postal_code: params.shippingAddress.postalCode,
            country_code: 'IDN',
          },
        }),
      },
      item_details: params.itemDetails.map(item => ({
        id: item.id,
        price: Math.round(item.price),
        quantity: item.quantity,
        name: item.name.substring(0, 50), // Midtrans limit
      })),
      callbacks: {
        finish: params.callbacks?.finish || `${process.env.NEXT_PUBLIC_SITE_URL}/market/orders/success`,
        error: params.callbacks?.error || `${process.env.NEXT_PUBLIC_SITE_URL}/market/orders/success`,
        pending: params.callbacks?.pending || `${process.env.NEXT_PUBLIC_SITE_URL}/market/orders/success`,
      },
      expiry: {
        duration: 24,
        unit: 'hours',
      },
      credit_card: {
        secure: true,
      },
    };

    console.log('🔄 Creating Snap token for order:', params.orderId);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.token) {
      console.error('❌ Snap token creation failed:', data);
      throw new Error(data.error_messages?.join(', ') || 'Failed to create payment token');
    }

    console.log('✅ Snap token created successfully');

    return {
      token: data.token,
      redirectUrl: data.redirect_url,
    };
  }

  /**
   * Get transaction status from Midtrans API
   */
  async getTransactionStatus(orderId: string): Promise<MidtransTransactionStatus> {
    const normalizedOrderId = normalizeOrderId(orderId);
    const url = `${this.urls.core}/v2/${normalizedOrderId}/status`;

    console.log('🔍 Checking Midtrans status for:', normalizedOrderId);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': getAuthHeader(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Failed to get transaction status:', data);
      throw new Error(data.status_message || 'Failed to get transaction status');
    }

    console.log('✅ Midtrans status:', {
      orderId: data.order_id,
      status: data.transaction_status,
      fraudStatus: data.fraud_status,
    });

    return data;
  }

  /**
   * Cancel transaction in Midtrans
   */
  async cancelTransaction(orderId: string): Promise<void> {
    const normalizedOrderId = normalizeOrderId(orderId);
    const url = `${this.urls.core}/v2/${normalizedOrderId}/cancel`;

    console.log('❌ Cancelling transaction:', normalizedOrderId);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error_messages?.join(', ') || 'Failed to cancel transaction');
    }

    console.log('✅ Transaction cancelled successfully');
  }

  /**
   * Process webhook notification
   */
  processNotification(rawNotification: any): {
    isValid: boolean;
    notification: MidtransNotification | null;
    mappedStatus: ReturnType<typeof mapMidtransStatus> | null;
    error?: string;
  } {
    // 1. Validate required fields
    const notification = validateNotification(rawNotification);
    if (!notification) {
      return {
        isValid: false,
        notification: null,
        mappedStatus: null,
        error: 'Missing required fields in notification',
      };
    }

    // 2. Verify signature
    const isSignatureValid = verifySignature(
      notification.order_id,
      notification.status_code,
      notification.gross_amount,
      notification.signature_key
    );

    if (!isSignatureValid) {
      return {
        isValid: false,
        notification,
        mappedStatus: null,
        error: 'Invalid signature',
      };
    }

    // 3. Map status
    const mappedStatus = mapMidtransStatus(
      notification.transaction_status,
      notification.fraud_status
    );

    return {
      isValid: true,
      notification,
      mappedStatus,
    };
  }
}

// Export singleton instance
export const midtransService = new MidtransService();
