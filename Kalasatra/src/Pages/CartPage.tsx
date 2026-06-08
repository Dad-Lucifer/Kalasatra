import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCheckout } from '../hooks/useCheckout';
import { apiRequest } from '../utils/api';

// ─── Types ────────────────────────────────────────────────────────────────────
type AlterAddress = {
  id: string;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

type ModalStep = 'choose' | 'new';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice, syncing } = useCart();
  const { handleCheckout, isCheckingOut } = useCheckout();
  const navigate = useNavigate();

  // ─── Modal State ────────────────────────────────────────────────────────────
  const [checkingAddress, setCheckingAddress]   = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [modalStep, setModalStep]               = useState<ModalStep>('choose');

  // ─── Existing Addresses ─────────────────────────────────────────────────────
  const [defaultAddress, setDefaultAddress]     = useState<AlterAddress | null>(null);
  const [alterAddresses, setAlterAddresses]     = useState<AlterAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // ─── New Address Form ───────────────────────────────────────────────────────
  const [savingAddress, setSavingAddress] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    full_name:     '',
    address_line1: '',
    address_line2: '',
    pincode:       '',
    city:          '',
    state:         '',
  });

  // ─── Load all addresses when modal opens ───────────────────────────────────
  useEffect(() => {
    if (!showAddressModal) return;
    loadAddresses();
  }, [showAddressModal]);

  const loadAddresses = async () => {
    setLoadingAddresses(true);
    try {
      // 1. Primary address from users table
      const profileRes = await apiRequest('/user/profile') as any;
      if (profileRes.success && profileRes.data?.address_line1) {
        const d = profileRes.data;
        setDefaultAddress({
          id: 'primary',
          full_name:     d.name || 'My Address',
          address_line1: d.address_line1,
          address_line2: d.address_line2,
          city:          d.city,
          state:         d.state,
          pincode:       d.pincode,
          country:       d.country || 'India',
        });
      } else {
        setDefaultAddress(null);
      }

      // 2. Alternate addresses from alter_address table
      const altRes = await apiRequest('/addresses') as any;
      if (altRes.success) {
        setAlterAddresses(altRes.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // ─── Proceed to checkout button ─────────────────────────────────────────────
  const onProceedToCheckout = async () => {
    if (!localStorage.getItem('accessToken')) {
      navigate('/auth');
      return;
    }
    setCheckingAddress(true);
    try {
      const profileRes = await apiRequest('/user/profile') as any;
      const altRes     = await apiRequest('/addresses') as any;
      const hasDefault = profileRes.success && profileRes.data?.address_line1;
      const hasAlts    = altRes.success && altRes.data?.length > 0;

      if (hasDefault || hasAlts) {
        setModalStep('choose');
      } else {
        setModalStep('new');
      }
      setShowAddressModal(true);
    } catch {
      setModalStep('new');
      setShowAddressModal(true);
    } finally {
      setCheckingAddress(false);
    }
  };

  // ─── Pincode auto-fill ──────────────────────────────────────────────────────
  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setNewAddressForm(prev => ({ ...prev, pincode: val }));
    if (val.length === 6) {
      try {
        const res = await apiRequest<any>(`/pincode/${val}`) as any;
        if (res.success && res.postOffices?.length > 0) {
          const po = res.postOffices[0];
          setNewAddressForm(prev => ({ ...prev, city: po.District, state: po.State }));
        }
      } catch { /* ignore */ }
    }
  };

  // ─── Confirm selected address ───────────────────────────────────────────────
  const confirmSelectedAddress = () => {
    if (!selectedAddressId) {
      alert('Please select a delivery address.');
      return;
    }
    setShowAddressModal(false);
    handleCheckout();
  };

  // ─── Save new address ────────────────────────────────────────────────────────
  const saveNewAddress = async () => {
    const { full_name, address_line1, pincode, city, state } = newAddressForm;
    if (!full_name || !address_line1 || !pincode || !city || !state) {
      alert('Please fill in all required fields.');
      return;
    }
    setSavingAddress(true);
    try {
      const res = await apiRequest('/addresses', {
        method: 'POST',
        body: JSON.stringify({
          full_name,
          address_line1,
          address_line2: newAddressForm.address_line2 || undefined,
          city,
          state,
          pincode,
          country: 'India',
        }),
      }) as any;

      if (res.success) {
        setShowAddressModal(false);
        handleCheckout();
      } else {
        alert(res.message || 'Failed to save address.');
      }
    } catch {
      alert('An error occurred while saving the address.');
    } finally {
      setSavingAddress(false);
    }
  };

  // ─── All saved addresses (primary + alts) merged ────────────────────────────
  const allAddresses: AlterAddress[] = [
    ...(defaultAddress ? [defaultAddress] : []),
    ...alterAddresses,
  ];

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-rich-black relative">
      <div className="h-20 lg:h-24" />

      <section className="relative border-b border-luxury-gold/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(212,175,55,0.06),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-16 lg:py-20">
          <div>
            <Link to="/" className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-luxury-gold/60 hover:text-luxury-gold transition-colors mb-3 sm:mb-4 inline-block">
              ← Back to Home
            </Link>
            <h1 className="font-heading text-3xl sm:text-5xl lg:text-7xl font-bold text-soft-white mt-1 sm:mt-2">
              Your Cart
            </h1>
            <p className="text-sm sm:text-lg text-soft-white/60 mt-2 sm:mt-3 font-light">
              {totalItems === 0 ? 'Your cart is empty.' : `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart`}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
        {syncing ? (
          <div className="flex items-center justify-center py-20 sm:py-32">
            <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-luxury-gold/30 border-t-luxury-gold rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 sm:py-32">
            <p className="text-soft-white/50 text-sm sm:text-lg mb-4 sm:mb-6">Your cart is empty.</p>
            <Link
              to="/products/mens-collection"
              className="inline-block px-6 sm:px-8 py-3 sm:py-3.5 bg-luxury-gold text-rich-black font-bold uppercase tracking-[0.2em] text-xs sm:text-sm hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] transition-all duration-500"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1 space-y-3 sm:space-y-4">
              {items.map((item) => {
                const key = `${item.productId}-${item.size}-${item.color}`;
                return (
                  <div
                    key={key}
                    className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-dark-charcoal border border-luxury-gold/10 hover:border-luxury-gold/30 transition-all duration-300"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-rich-black border border-luxury-gold/10 flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-heading text-2xl font-bold text-luxury-gold/30">K</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <Link
                          to={`/products/${item.slug}`}
                          className="font-heading text-base font-bold text-soft-white hover:text-luxury-gold transition-colors"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-soft-white/50 mt-1 uppercase tracking-wider">
                          {item.size} / {item.color}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 gap-1 sm:gap-2">
                        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
                          <div className="flex items-center border border-luxury-gold/20">
                            <button
                              onClick={() => updateQuantity(item.productId, item.size, item.color, -1)}
                              className="px-3 sm:px-3 py-1.5 sm:py-1.5 text-soft-white/60 hover:text-soft-white bg-transparent border-none cursor-pointer text-xs sm:text-sm min-w-[36px] sm:min-w-0 flex items-center justify-center"
                            >−</button>
                            <span className="px-2 sm:px-3 py-1.5 sm:py-1.5 text-xs sm:text-sm text-soft-white min-w-[28px] text-center font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.size, item.color, 1)}
                              className="px-3 sm:px-3 py-1.5 sm:py-1.5 text-soft-white/60 hover:text-soft-white bg-transparent border-none cursor-pointer text-xs sm:text-sm min-w-[36px] sm:min-w-0 flex items-center justify-center"
                            >+</button>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId, item.size, item.color)}
                            className="text-[10px] sm:text-xs text-soft-white/30 hover:text-red-400 transition-colors bg-transparent border-none p-0 cursor-pointer uppercase tracking-wider whitespace-nowrap"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <span className="font-heading text-sm sm:text-base font-bold text-luxury-gold whitespace-nowrap text-right">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div className="pt-4 flex justify-between items-center">
                <button
                  onClick={clearCart}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 border border-luxury-gold/20 text-soft-white/50 font-semibold uppercase tracking-[0.1em] text-[10px] sm:text-xs hover:text-red-400 hover:border-red-400/30 transition-all duration-300 bg-transparent cursor-pointer"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            <div className="lg:w-80 shrink-0">
              <div className="bg-dark-charcoal border border-luxury-gold/10 p-4 sm:p-6 sticky top-20 sm:top-28">
                <h3 className="font-heading text-base sm:text-lg font-bold text-soft-white mb-4 sm:mb-6 uppercase tracking-wider">
                  Order Summary
                </h3>

                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between text-soft-white/70">
                    <span>Items ({totalItems})</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-soft-white/70">
                    <span>Shipping</span>
                    <span className="text-green-500">Free</span>
                  </div>
                  <div className="border-t border-luxury-gold/10 pt-2 sm:pt-3 flex justify-between font-heading text-base sm:text-lg font-bold text-luxury-gold">
                    <span>Total</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={onProceedToCheckout}
                  disabled={isCheckingOut || checkingAddress || totalPrice === 0}
                  className="w-full mt-4 sm:mt-6 px-4 sm:px-6 py-3 sm:py-3.5 bg-luxury-gold text-rich-black font-bold uppercase tracking-[0.2em] text-xs sm:text-sm hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {checkingAddress ? 'Checking Info...' : isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
                </button>

                <Link
                  to="/products/mens-collection"
                  className="block w-full mt-2 sm:mt-3 px-4 sm:px-6 py-2.5 sm:py-3 text-center text-[10px] sm:text-xs uppercase tracking-[0.15em] text-soft-white/50 hover:text-luxury-gold transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Address Modal ────────────────────────────────────────────────────── */}
      {showAddressModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-deep-black/50 backdrop-blur-sm p-4">
          <div className="bg-pure-white w-full max-w-lg relative shadow-2xl border border-cold-grey-light">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-cold-grey-light">
              <div>
                <h3 className="text-lg font-bold font-heading uppercase tracking-widest text-deep-black leading-none">
                  Delivery Details
                </h3>
                <p className="text-[10px] text-cold-grey tracking-widest uppercase mt-1">
                  {modalStep === 'choose' ? 'Select a delivery address' : 'Enter a new address'}
                </p>
              </div>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-cold-grey hover:text-deep-black transition-colors cursor-pointer p-1"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-6">

              {/* ── STEP 1: Choose existing address ─────────────────────────── */}
              {modalStep === 'choose' && (
                <>
                  {loadingAddresses ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="w-6 h-6 border-2 border-cold-grey-light border-t-deep-black rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {allAddresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={`flex items-start gap-4 p-4 border cursor-pointer transition-all duration-150 ${
                            selectedAddressId === addr.id
                              ? 'border-deep-black bg-cold-white'
                              : 'border-cold-grey-light hover:border-deep-black/40 bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="delivery_address"
                            value={addr.id}
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-1 accent-deep-black shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-deep-black uppercase tracking-wide">
                              {addr.full_name}
                              {addr.id === 'primary' && (
                                <span className="ml-2 text-[9px] bg-accent-yellow text-deep-black px-2 py-0.5 font-bold tracking-widest uppercase">Default</span>
                              )}
                            </p>
                            <p className="text-xs text-cold-grey mt-1 leading-relaxed">
                              {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}
                            </p>
                            <p className="text-xs text-cold-grey">
                              {addr.city}, {addr.state} — {addr.pincode}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-3 mt-5">
                    <button
                      onClick={confirmSelectedAddress}
                      className="w-full bg-accent-yellow text-deep-black py-3 font-bold text-xs tracking-widest uppercase hover:bg-deep-black hover:text-pure-white transition-colors cursor-pointer disabled:opacity-50"
                      disabled={!selectedAddressId}
                    >
                      Deliver Here
                    </button>
                    <button
                      onClick={() => setModalStep('new')}
                      className="w-full border border-cold-grey-light text-deep-black py-3 font-bold text-xs tracking-widest uppercase hover:border-deep-black transition-colors cursor-pointer"
                    >
                      + Use a New Address
                    </button>
                  </div>
                </>
              )}

              {/* ── STEP 2: Enter new address ────────────────────────────────── */}
              {modalStep === 'new' && (
                <>
                  {allAddresses.length > 0 && (
                    <button
                      onClick={() => setModalStep('choose')}
                      className="flex items-center gap-1 text-[10px] text-cold-grey hover:text-deep-black uppercase tracking-widest mb-5 cursor-pointer transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                      Back to saved addresses
                    </button>
                  )}

                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={newAddressForm.full_name}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, full_name: e.target.value })}
                      placeholder="FULL NAME *"
                      className="w-full px-4 py-3 bg-cold-white border border-cold-grey-light text-sm font-bold text-deep-black placeholder-cold-grey focus:outline-none focus:border-deep-black transition-colors tracking-widest"
                    />

                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newAddressForm.pincode}
                        onChange={handlePincodeChange}
                        placeholder="PINCODE *"
                        className="w-1/2 px-4 py-3 bg-cold-white border border-cold-grey-light text-sm font-bold text-deep-black placeholder-cold-grey focus:outline-none focus:border-deep-black transition-colors tracking-widest"
                      />
                      <input
                        type="text"
                        value={newAddressForm.city}
                        readOnly
                        placeholder="CITY (AUTO)"
                        className="w-1/2 px-4 py-3 bg-cold-grey-light/30 border border-cold-grey-light text-sm font-bold text-cold-grey cursor-not-allowed tracking-widest"
                      />
                    </div>

                    <input
                      type="text"
                      value={newAddressForm.address_line1}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, address_line1: e.target.value })}
                      placeholder="HOUSE NO., BUILDING, STREET *"
                      className="w-full px-4 py-3 bg-cold-white border border-cold-grey-light text-sm font-bold text-deep-black placeholder-cold-grey focus:outline-none focus:border-deep-black transition-colors tracking-widest"
                    />

                    <input
                      type="text"
                      value={newAddressForm.address_line2}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, address_line2: e.target.value })}
                      placeholder="LOCALITY / LANDMARK (OPTIONAL)"
                      className="w-full px-4 py-3 bg-cold-white border border-cold-grey-light text-sm font-bold text-deep-black placeholder-cold-grey focus:outline-none focus:border-deep-black transition-colors tracking-widest"
                    />

                    <button
                      onClick={saveNewAddress}
                      disabled={savingAddress}
                      className="w-full mt-2 bg-accent-yellow text-deep-black py-3 font-bold text-xs tracking-widest uppercase hover:bg-deep-black hover:text-pure-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {savingAddress ? 'Saving...' : 'Save & Deliver Here'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
