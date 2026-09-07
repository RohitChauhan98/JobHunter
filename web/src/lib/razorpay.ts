'use client';

export interface RazorpayCheckoutResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface OpenCheckoutOptions {
  keyId: string;
  orderId: string;
  amount: number;
  currency?: string;
  name?: string;
  description?: string;
  prefill?: { email?: string; name?: string; contact?: string };
  themeColor?: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (err: unknown) => void) => void;
    };
  }
}

let scriptPromise: Promise<boolean> | null = null;

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-razorpay]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpay = 'true';
    script.onload = () => resolve(true);
    script.onerror = () => {
      scriptPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return scriptPromise;
}

/** Open Razorpay Checkout and resolve with payment response (or reject on cancel/failure). */
export async function openRazorpayCheckout(
  opts: OpenCheckoutOptions,
): Promise<RazorpayCheckoutResponse> {
  const ok = await loadRazorpayScript();
  if (!ok || !window.Razorpay) {
    throw new Error('Unable to load Razorpay Checkout. Check your network connection.');
  }

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: opts.keyId,
      amount: opts.amount,
      currency: opts.currency || 'INR',
      name: opts.name || 'JobHunter',
      description: opts.description || 'Payment',
      order_id: opts.orderId,
      prefill: opts.prefill || {},
      theme: { color: opts.themeColor || '#1a4d3a' },
      handler: (response: RazorpayCheckoutResponse) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
    });

    rzp.on('payment.failed', (err: unknown) => {
      const msg =
        (err as { error?: { description?: string } })?.error?.description || 'Payment failed';
      reject(new Error(msg));
    });

    rzp.open();
  });
}
