export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Already loaded — resolve immediately
    if (typeof (window as any).Razorpay !== 'undefined') {
      resolve(true);
      return;
    }

    // Script tag already in DOM but not yet executed
    if (document.querySelector('script[src*="checkout.razorpay.com"]')) {
      // Poll until Razorpay becomes available
      const interval = setInterval(() => {
        if (typeof (window as any).Razorpay !== 'undefined') {
          clearInterval(interval);
          resolve(true);
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/** Razorpay test key — switch to rzp_live_* for production */
export const RAZORPAY_KEY = 'rzp_test_Sy2wxO64TxSBRa';
