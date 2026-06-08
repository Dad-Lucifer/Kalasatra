import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { apiRequest } from '../utils/api';
import { loadRazorpayScript } from '../utils/razorpay';
import { useNavigate } from 'react-router-dom';

export const useCheckout = () => {
  const { totalPrice, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!localStorage.getItem('accessToken')) {
      navigate('/auth');
      return;
    }

    if (totalPrice <= 0) return;

    setIsCheckingOut(true);

    try {
      // 1. Load Razorpay script
      const res = await loadRazorpayScript();
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        setIsCheckingOut(false);
        return;
      }

      // 2. Create Order on backend
      const orderRes = await apiRequest('/payment/create-order', {
        method: 'POST',
        body: JSON.stringify({ amount: totalPrice }),
      });

      if (!orderRes.success || !orderRes.data) {
        alert(orderRes.message || 'Failed to create order');
        setIsCheckingOut(false);
        return;
      }

      const order = orderRes.data;

      // 3. Initialize Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
        amount: order.amount,
        currency: order.currency,
        name: 'Kalasatra',
        description: 'Store Purchase',
        order_id: order.id,
        handler: async function (response: any) {
          // 4. Verify Payment on backend
          const verifyRes = await apiRequest('/payment/verify', {
            method: 'POST',
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (verifyRes.success) {
            alert('Payment Successful!');
            clearCart();
            // Optional: redirect to success page
            // navigate('/success');
          } else {
            alert(verifyRes.message || 'Payment Verification Failed');
          }
        },
        prefill: {
          name: 'Customer', // Can be dynamic
          email: 'customer@example.com', // Can be dynamic
          contact: '9999999999',
        },
        theme: {
          color: '#D4AF37', // Luxury gold
        },
        modal: {
          confirm_close: false, // Bypasses the buggy native exit modal
          escape: true,
          handleback: true,
          ondismiss: function() {
            setIsCheckingOut(false);
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

      // Handle failed payment case
      paymentObject.on('payment.failed', function (response: any) {
        alert('Payment Failed: ' + response.error.description);
      });

    } catch (error) {
      console.error(error);
      alert('An error occurred during checkout');
      setIsCheckingOut(false);
    }
  };

  return { handleCheckout, isCheckingOut };
};
