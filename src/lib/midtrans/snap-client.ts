"use client";

/**
 * Midtrans Snap Client - Client-side SDK loader
 * Handles loading Snap.js and payment popup
 */

// Extend Window interface for Snap
declare global {
  interface Window {
    snap?: {
      pay: (snapToken: string, options?: SnapPayOptions) => void;
      hide: () => void;
      show: () => void;
    };
  }
}

export interface SnapPayOptions {
  onSuccess?: (result: SnapPaymentResult) => void;
  onPending?: (result: SnapPaymentResult) => void;
  onError?: (result: SnapPaymentResult) => void;
  onClose?: () => void;
  skipOrderSummary?: boolean;
  embedId?: string;
}

export interface SnapPaymentResult {
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

class MidtransSnapClient {
  private clientKey: string;
  private isProduction: boolean;
  private isLoaded: boolean = false;
  private loadPromise: Promise<void> | null = null;

  constructor() {
    this.clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
    this.isProduction = process.env.NEXT_PUBLIC_MIDTRANS_ENVIRONMENT === "production";
  }

  /**
   * Get Snap.js URL based on environment
   */
  private getSnapUrl(): string {
    return this.isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
  }

  /**
   * Load Snap.js SDK from CDN
   * Returns a promise that resolves when loaded
   */
  loadSnapJS(): Promise<void> {
    // Return existing promise if already loading
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Return immediately if already loaded
    if (this.isLoaded && typeof window !== "undefined" && window.snap) {
      return Promise.resolve();
    }

    this.loadPromise = new Promise((resolve, reject) => {
      // Check if running in browser
      if (typeof window === "undefined") {
        reject(new Error("Snap.js can only be loaded in browser"));
        return;
      }

      // Check if already loaded
      if (window.snap) {
        this.isLoaded = true;
        console.log("✅ Midtrans Snap.js already loaded");
        resolve();
        return;
      }

      // Check if script tag already exists
      const existingScript = document.querySelector(
        `script[src*="midtrans.com/snap/snap.js"]`
      );
      if (existingScript) {
        // Wait for existing script to load
        existingScript.addEventListener("load", () => {
          if (window.snap) {
            this.isLoaded = true;
            console.log("✅ Midtrans Snap.js loaded (existing script)");
            resolve();
          } else {
            reject(new Error("Snap.js loaded but window.snap is not available"));
          }
        });
        existingScript.addEventListener("error", () => {
          reject(new Error("Failed to load existing Snap.js script"));
        });
        return;
      }

      // Create and load script
      console.log("🔄 Loading Midtrans Snap.js...");
      const script = document.createElement("script");
      script.src = this.getSnapUrl();
      script.setAttribute("data-client-key", this.clientKey);
      script.async = true;

      script.onload = () => {
        // Small delay to ensure window.snap is available
        setTimeout(() => {
          if (window.snap) {
            this.isLoaded = true;
            console.log("✅ Midtrans Snap.js loaded successfully");
            resolve();
          } else {
            reject(new Error("Snap.js loaded but window.snap is not available"));
          }
        }, 100);
      };

      script.onerror = (error) => {
        console.error("❌ Failed to load Snap.js:", error);
        this.loadPromise = null; // Allow retry
        reject(new Error("Failed to load Midtrans Snap.js"));
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  /**
   * Open Snap payment popup
   * Automatically loads Snap.js if not already loaded
   */
  async pay(snapToken: string, options: SnapPayOptions = {}): Promise<void> {
    try {
      console.log("💳 Opening Snap payment...");

      // Ensure Snap.js is loaded
      await this.loadSnapJS();

      if (!window.snap) {
        throw new Error("Snap.js is not available");
      }

      // Default options with logging
      const snapOptions: SnapPayOptions = {
        onSuccess: (result) => {
          console.log("✅ Payment successful:", result);
          options.onSuccess?.(result);
        },
        onPending: (result) => {
          console.log("⏳ Payment pending:", result);
          options.onPending?.(result);
        },
        onError: (result) => {
          console.error("❌ Payment error:", result);
          options.onError?.(result);
        },
        onClose: () => {
          console.log("🚪 Payment popup closed");
          options.onClose?.();
        },
      };

      // Open Snap payment popup
      window.snap.pay(snapToken, snapOptions);
    } catch (error) {
      console.error("❌ Snap pay error:", error);
      throw error;
    }
  }

  /**
   * Hide Snap payment popup
   */
  hide(): void {
    if (this.isLoaded && window.snap) {
      window.snap.hide();
    }
  }

  /**
   * Show Snap payment popup (if hidden)
   */
  show(): void {
    if (this.isLoaded && window.snap) {
      window.snap.show();
    }
  }

  /**
   * Check if Snap.js is loaded and ready
   */
  isReady(): boolean {
    return this.isLoaded && typeof window !== "undefined" && !!window.snap;
  }

  /**
   * Reset loader state (useful for retry)
   */
  reset(): void {
    this.isLoaded = false;
    this.loadPromise = null;
  }
}

// Export singleton instance
export const snapClient = new MidtransSnapClient();

// Export class for custom instances
export { MidtransSnapClient };
