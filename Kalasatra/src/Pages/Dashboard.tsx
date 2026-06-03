import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRequest, clearTokens } from '../utils/api';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import BottomMobileNav from '../components/landing/BottomMobileNav';
import { 
  FiPackage, FiGrid, FiCreditCard, FiAward, FiSmartphone,
  FiChevronRight, FiGift, FiStar, FiUser, FiMapPin, FiSettings, FiCheckCircle
} from 'react-icons/fi';

interface DashboardProps {
  onLogout: () => void;
}

interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  gender?: string;
  birthday?: string;
  alternate_phone?: string;
  hint_name?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  kalasatra_credits?: number;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'edit'>('overview');

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    gender: '',
    birthday: '',
    alternatePhone: '',
    hintName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [wishlistCount, setWishlistCount] = useState(0);

  const fetchProfile = async () => {
    setLoading(true);
    const res = await apiRequest<{ user: UserProfile }>('/auth/me');
    setLoading(false);

    if (res.success && res.data) {
      setProfile(res.data.user);
      setForm({
        name: res.data.user.name || '',
        phone: res.data.user.phone || '',
        email: res.data.user.email || '',
        gender: res.data.user.gender || '',
        birthday: res.data.user.birthday || '',
        alternatePhone: res.data.user.alternate_phone || '',
        hintName: res.data.user.hint_name || '',
        addressLine1: res.data.user.address_line1 || '',
        addressLine2: res.data.user.address_line2 || '',
        city: res.data.user.city || '',
        state: res.data.user.state || '',
        pincode: res.data.user.pincode || '',
        country: res.data.user.country || 'India',
      });
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchWishlistCount();
  }, []);

  const fetchWishlistCount = async () => {
    const res = await apiRequest('/wishlist');
    if (res.success && Array.isArray(res.data)) {
      setWishlistCount(res.data.length);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const body: Record<string, unknown> = {
      name: form.name,
    };
    if (form.phone) body.phone = form.phone;
    if (form.email) body.email = form.email;
    if (form.gender) body.gender = form.gender;
    if (form.birthday) body.birthday = form.birthday;
    if (form.alternatePhone) body.alternate_phone = form.alternatePhone;
    if (form.hintName) body.hint_name = form.hintName;
    if (form.addressLine1) body.address_line1 = form.addressLine1;
    if (form.addressLine2) body.address_line2 = form.addressLine2;
    if (form.city) body.city = form.city;
    if (form.state) body.state = form.state;
    if (form.pincode) body.pincode = form.pincode;
    if (form.country) body.country = form.country;

    const res = await apiRequest<{ user: UserProfile }>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });

    setSaving(false);

    if (res.success && res.data) {
      setProfile(res.data.user);
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } else {
      setMessage({ type: 'error', text: res.message || 'Failed to update profile.' });
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setSaving(true);
    setMessage(null);

    const res = await apiRequest('/auth/me', { method: 'DELETE' });

    setSaving(false);

    if (res.success) {
      clearTokens();
      onLogout();
    } else {
      setMessage({ type: 'error', text: res.message || 'Failed to delete account.' });
    }
  };

  const handleRedeemCoupon = async () => {
    if (!couponCode.trim()) return;
    setRedeeming(true);
    setCouponMessage(null);
    const res = await apiRequest('/coupons/redeem', {
      method: 'POST',
      body: JSON.stringify({ code: couponCode.trim() }),
    });
    setRedeeming(false);
    if (res.success && res.data) {
      setCouponMessage({ type: 'success', text: res.message || `You earned ${res.data.coinsAwarded} Kalasatra coins!` });
      setCouponCode('');
      fetchProfile();
    } else {
      setCouponMessage({ type: 'error', text: res.message || 'Failed to redeem coupon.' });
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await apiRequest('/auth/logout', { method: 'POST' });
    clearTokens();
    setLoading(false);
    onLogout();
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-cold-white flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-deep-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userName = profile?.name || 'Authorized User';

  return (
    <>
      {/* DESKTOP VIEW */}
      <div className="hidden md:flex flex-col min-h-screen bg-pure-white">
        <Navbar />
        
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 lg:px-8 py-10 flex gap-8">
          {/* Sidebar */}
          <aside className="w-[250px] shrink-0 border-r border-cold-grey-light pr-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-deep-black tracking-tight">Account</h2>
              <p className="text-sm text-cold-grey">{userName}</p>
            </div>
            
            <nav className="space-y-6">
              <div>
                <button onClick={() => setActiveView('overview')} className={`font-bold text-sm tracking-wider cursor-pointer transition-colors ${activeView === 'overview' ? 'text-accent-yellow' : 'text-deep-black hover:text-accent-yellow'}`}>Overview</button>
              </div>
              
              <div>
                <h3 className="text-xs uppercase font-bold text-cold-grey tracking-widest mb-3 border-b border-cold-grey-light pb-2">Orders</h3>
                <ul className="space-y-3 text-sm text-deep-black">
                  <li><a href="#" className="hover:text-accent-yellow transition-colors font-semibold">Orders & Returns</a></li>
                </ul>
              </div>

              <div>
                  <h3 className="text-xs uppercase font-bold text-cold-grey tracking-widest mb-3 border-b border-cold-grey-light pb-2">Credits</h3>
                  <ul className="space-y-3 text-sm text-deep-black">
                    <li><button onClick={() => setCouponModalOpen(true)} className="hover:text-accent-yellow transition-colors font-semibold cursor-pointer bg-transparent border-none p-0">Coupons</button></li>
                    <li><span className="font-semibold text-cold-grey">Kalasatra Credit: {profile?.kalasatra_credits ?? 0}</span></li>
                  </ul>
              </div>

              <div>
                <h3 className="text-xs uppercase font-bold text-cold-grey tracking-widest mb-3 border-b border-cold-grey-light pb-2">Account</h3>
                <ul className="space-y-3 text-sm text-deep-black">
                  <li><button onClick={() => setActiveView('edit')} className={`transition-colors font-semibold cursor-pointer ${activeView === 'edit' ? 'text-accent-yellow' : 'hover:text-accent-yellow'}`}>Profile</button></li>
                  <li><a href="#" className="hover:text-accent-yellow transition-colors font-semibold">Addresses</a></li>
                  <li><button onClick={handleLogout} className="text-red-500 hover:text-red-600 transition-colors font-semibold cursor-pointer">Log Out</button></li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs uppercase font-bold text-cold-grey tracking-widest mb-3 border-b border-cold-grey-light pb-2">Legal</h3>
                <ul className="space-y-3 text-sm text-deep-black">
                  <li><a href="#" className="hover:text-accent-yellow transition-colors font-semibold">Terms of Use</a></li>
                  <li><a href="#" className="hover:text-accent-yellow transition-colors font-semibold">Privacy Center</a></li>
                </ul>
              </div>
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 pb-10">
            {activeView === 'overview' ? (
              <>
                {/* Profile Summary Card */}
                <div className="bg-cold-white border border-cold-grey-light p-8 flex items-center justify-between mb-8 shadow-sm">
                  <div className="flex flex-col items-center justify-center w-32 h-32 bg-cold-grey-light text-cold-grey relative">
                    <FiUser size={48} className="opacity-50" />
                  </div>
                  <button onClick={() => setActiveView('edit')} className="px-6 py-2 border border-deep-black text-deep-black font-bold uppercase tracking-widest text-xs hover:bg-deep-black hover:text-pure-white transition-colors cursor-pointer">
                    Edit Profile
                  </button>
                </div>

                {/* Widgets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Card 1 */}
                  <div className="bg-pure-white border border-cold-grey-light p-6 flex flex-col items-center justify-center text-center gap-3 hover:border-deep-black transition-colors cursor-pointer shadow-sm hover:shadow-[4px_4px_0px_0px_rgba(11,12,16,1)] group">
                    <FiPackage size={32} className="text-deep-black" />
                    <div>
                      <h4 className="font-bold text-deep-black text-sm uppercase tracking-wider">Orders</h4>
                      <p className="text-xs text-cold-grey mt-1">Check your order status</p>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <Link to="/wishlist" className="bg-pure-white border border-cold-grey-light p-6 flex flex-col items-center justify-center text-center gap-3 hover:border-deep-black transition-colors cursor-pointer shadow-sm hover:shadow-[4px_4px_0px_0px_rgba(11,12,16,1)] group">
                    <FiGrid size={32} className="text-deep-black" />
                    <div>
                      <h4 className="font-bold text-deep-black text-sm uppercase tracking-wider">Wishlist & Collections</h4>
                      <p className="text-xs text-cold-grey mt-1">{wishlistCount} item{wishlistCount !== 1 ? 's' : ''} saved</p>
                    </div>
                  </Link>

                  {/* Card 3 */}
                  <div onClick={() => setCouponModalOpen(true)} className="bg-pure-white border border-cold-grey-light p-6 flex flex-col items-center justify-center text-center gap-3 hover:border-deep-black transition-colors cursor-pointer shadow-sm hover:shadow-[4px_4px_0px_0px_rgba(11,12,16,1)] group">
                    <FiCreditCard size={32} className="text-deep-black" />
                    <div>
                      <h4 className="font-bold text-deep-black text-sm uppercase tracking-wider">Kalasatra Credit</h4>
                      <p className="text-xs text-cold-grey mt-1">
                        {profile?.kalasatra_credits ?? 0} coins available
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-pure-white border border-cold-grey-light p-8 md:p-10 shadow-sm max-w-3xl">
                <h2 className="text-2xl font-bold text-deep-black mb-8">Edit Details</h2>

                {message && (
                  <div className={`mb-6 p-4 text-sm font-bold uppercase tracking-widest ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                    {message.text}
                  </div>
                )}
                
                <div className="space-y-6">
                  {/* Mobile Number */}
                  <div className="flex border border-cold-grey-light p-4 justify-between items-center group focus-within:border-deep-black transition-colors">
                    {editingPhone ? (
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+91xxxxxxxxxx"
                        className="w-full text-sm font-bold text-deep-black outline-none bg-transparent"
                        autoFocus
                      />
                    ) : (
                      <div>
                        <span className="text-xs text-cold-grey block mb-1">Mobile Number*</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-deep-black">{form.phone || '+91 -'}</span>
                          {form.phone && <FiCheckCircle className="text-green-500" size={16} />}
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => { setEditingPhone(!editingPhone); if (!editingPhone) setEditingEmail(false); }}
                      className="px-6 py-2 border border-cold-grey-light text-xs font-bold uppercase tracking-widest text-deep-black hover:border-deep-black transition-colors cursor-pointer shrink-0"
                    >
                      {editingPhone ? 'CANCEL' : 'CHANGE'}
                    </button>
                  </div>

                  {/* Email */}
                  <div className="flex border border-cold-grey-light p-4 justify-between items-center group focus-within:border-deep-black transition-colors">
                    {editingEmail ? (
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="email@example.com"
                        className="w-full text-sm font-bold text-deep-black outline-none bg-transparent"
                        autoFocus
                      />
                    ) : (
                      <div>
                        <span className="text-xs text-cold-grey block mb-1">Email</span>
                        <span className="text-sm text-deep-black">{form.email}</span>
                      </div>
                    )}
                    <button
                      onClick={() => { setEditingEmail(!editingEmail); if (!editingEmail) setEditingPhone(false); }}
                      className="px-6 py-2 border border-cold-grey-light text-xs font-bold uppercase tracking-widest text-deep-black hover:border-deep-black transition-colors cursor-pointer shrink-0"
                    >
                      {editingEmail ? 'CANCEL' : 'CHANGE'}
                    </button>
                  </div>

                  {/* Full Name */}
                  <div className="border border-cold-grey-light px-4 py-2 focus-within:border-deep-black transition-colors relative">
                    <label className="text-[10px] text-cold-grey absolute top-2 bg-pure-white px-1 -mt-4 uppercase font-bold tracking-widest">Full Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full text-sm font-bold text-deep-black outline-none pt-2 bg-transparent"
                    />
                  </div>

                  {/* Gender Toggle */}
                  <div className="flex border border-cold-grey-light">
                    {['Male', 'Female'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setForm({ ...form, gender: form.gender === g ? '' : g })}
                        className={`flex-1 py-3 text-sm font-bold transition-colors cursor-pointer ${
                          form.gender === g
                            ? 'bg-deep-black text-pure-white'
                            : 'text-deep-black border-r border-cold-grey-light hover:bg-cold-white'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>

                  {/* Birthday */}
                  <div className="border border-cold-grey-light px-4 py-3 focus-within:border-deep-black transition-colors">
                    <input
                      type="date"
                      value={form.birthday}
                      onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                      className="w-full text-sm font-bold text-deep-black outline-none bg-transparent"
                    />
                  </div>

                  <h3 className="font-bold text-deep-black mt-8 mb-4">Alternate mobile details</h3>

                  {/* Alternate Mobile */}
                  <div className="flex border border-cold-grey-light px-4 py-3 focus-within:border-deep-black transition-colors items-center gap-3">
                    <span className="text-cold-grey text-sm">+91</span>
                    <div className="w-px h-4 bg-cold-grey-light" />
                    <input
                      type="tel"
                      placeholder="Mobile Number"
                      value={form.alternatePhone}
                      onChange={(e) => setForm({ ...form, alternatePhone: e.target.value })}
                      className="w-full text-sm text-deep-black outline-none bg-transparent placeholder:text-cold-grey"
                    />
                  </div>

                  {/* Hint Name */}
                  <div className="border border-cold-grey-light px-4 py-3 focus-within:border-deep-black transition-colors">
                    <input
                      type="text"
                      placeholder="Hint name"
                      value={form.hintName}
                      onChange={(e) => setForm({ ...form, hintName: e.target.value })}
                      className="w-full text-sm text-deep-black outline-none bg-transparent placeholder:text-cold-grey"
                    />
                  </div>

                  {/* Address Section */}
                  <h3 className="font-bold text-deep-black mt-8 mb-4">Address</h3>

                  <div className="border border-cold-grey-light px-4 py-3 focus-within:border-deep-black transition-colors">
                    <input
                      type="text"
                      placeholder="Address Line 1 (Street, Building)"
                      value={form.addressLine1}
                      onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                      className="w-full text-sm text-deep-black outline-none bg-transparent placeholder:text-cold-grey"
                    />
                  </div>

                  <div className="border border-cold-grey-light px-4 py-3 focus-within:border-deep-black transition-colors">
                    <input
                      type="text"
                      placeholder="Address Line 2 (Area, Landmark)"
                      value={form.addressLine2}
                      onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
                      className="w-full text-sm text-deep-black outline-none bg-transparent placeholder:text-cold-grey"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-cold-grey-light px-4 py-3 focus-within:border-deep-black transition-colors">
                      <input
                        type="text"
                        placeholder="City"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        className="w-full text-sm text-deep-black outline-none bg-transparent placeholder:text-cold-grey"
                      />
                    </div>
                    <div className="border border-cold-grey-light px-4 py-3 focus-within:border-deep-black transition-colors">
                      <input
                        type="text"
                        placeholder="State"
                        value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                        className="w-full text-sm text-deep-black outline-none bg-transparent placeholder:text-cold-grey"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-cold-grey-light px-4 py-3 focus-within:border-deep-black transition-colors">
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={form.pincode}
                        onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                        className="w-full text-sm text-deep-black outline-none bg-transparent placeholder:text-cold-grey"
                      />
                    </div>
                    <div className="border border-cold-grey-light px-4 py-3 focus-within:border-deep-black transition-colors">
                      <input
                        type="text"
                        placeholder="Country"
                        value={form.country}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                        className="w-full text-sm text-deep-black outline-none bg-transparent placeholder:text-cold-grey"
                      />
                    </div>
                  </div>

                  <div className="pt-8 border-t border-cold-grey-light mt-8">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={saving}
                      className="w-full py-4 text-sm font-bold uppercase tracking-widest text-[#ff3f6c] hover:bg-red-50 transition-colors cursor-pointer mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      DELETE ACCOUNT
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full py-4 text-sm font-bold uppercase tracking-widest bg-[#ff3f6c] text-pure-white hover:brightness-110 transition-colors cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'SAVING...' : 'SAVE DETAILS'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden flex flex-col min-h-screen bg-cold-white pb-20">
        
        {/* Dark Banner */}
        <div className="bg-deep-black text-pure-white px-5 pt-8 pb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-yellow/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-2xl font-bold tracking-tight">Welcome {userName}</h1>
              <div className="text-right">
                <div className="font-heading font-black text-xl tracking-wider flex items-center gap-1">
                  KALASATRA <span className="text-accent-yellow">X</span>
                </div>
                <div className="text-[10px] text-accent-yellow uppercase font-bold tracking-widest mt-1">Expired on 01 Jun</div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <FiUser className="text-cold-grey" />
                <span className="text-sm font-semibold">Join the exclusive X club</span>
              </div>
              <div className="flex items-center gap-3">
                <FiStar className="text-cold-grey" />
                <span className="text-sm font-semibold">Assured cashback on every order</span>
              </div>
              <div className="flex items-center gap-3">
                <FiGift className="text-cold-grey" />
                <span className="text-sm font-semibold">Win free gifts for order streaks</span>
              </div>
            </div>

            <div className="text-xs text-cold-grey font-semibold mb-2">
              Shop ₹5000 more to become a X member. <a href="#" className="text-pure-white underline decoration-accent-yellow underline-offset-4">More Details</a>
            </div>
            
            <div className="h-1.5 w-full bg-pure-white/20 rounded-full overflow-hidden mt-3 relative">
               <div className="absolute top-0 right-0 h-full w-full bg-pure-white/10" />
            </div>
            <div className="flex justify-between mt-1 text-[10px] font-bold text-cold-grey uppercase tracking-widest">
              <span>₹0</span>
              <span>₹5000</span>
            </div>
          </div>
        </div>

        {/* List Links */}
        <div className="bg-pure-white border-t border-cold-grey-light">
          {activeView === 'overview' ? (
            <ul className="flex flex-col">
              {[
                { label: 'Orders & Returns', action: undefined },
                { label: 'Wishlist', action: () => navigate('/wishlist') },
                { label: 'Coupons', action: () => setCouponModalOpen(true) },
                { label: 'Kalasatra Credit', action: undefined },
                { label: 'Profile', action: () => setActiveView('edit') },
                { label: 'Addresses', action: undefined },
                { label: 'Terms of Use', action: undefined },
                { label: 'Privacy Center', action: undefined },
              ].map((item) => (
                <li key={item.label} className="border-b border-cold-grey-light/50">
                  <button 
                    onClick={() => item.action ? item.action() : null}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-cold-white transition-colors cursor-pointer"
                  >
                    <span className="text-sm font-bold text-deep-black uppercase tracking-widest">{item.label}</span>
                    <FiChevronRight className="text-cold-grey" />
                  </button>
                </li>
              ))}
              
              <li>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-bold uppercase tracking-widest">Log Out</span>
                  <FiChevronRight className="opacity-50" />
                </button>
              </li>
            </ul>
          ) : (
            <div className="p-4 bg-pure-white">
              <button onClick={() => setActiveView('overview')} className="text-sm font-bold text-deep-black mb-6 uppercase tracking-widest flex items-center gap-2 cursor-pointer">
                <FiChevronRight className="rotate-180" /> Back to Dashboard
              </button>
              
              <h2 className="text-2xl font-bold text-deep-black mb-6">Edit Details</h2>

              {message && (
                <div className={`mb-4 p-3 text-xs font-bold uppercase tracking-widest ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                  {message.text}
                </div>
              )}
              
              <div className="space-y-5">
                <div className="border border-cold-grey-light p-4 focus-within:border-deep-black transition-colors">
                  <div className="flex justify-between items-center">
                    {editingPhone ? (
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+91xxxxxxxxxx"
                        className="w-full text-sm font-bold text-deep-black outline-none bg-transparent"
                        autoFocus
                      />
                    ) : (
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-cold-grey block mb-1">Mobile Number*</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-deep-black">{form.phone || '+91 -'}</span>
                          {form.phone && <FiCheckCircle className="text-green-500" size={14} />}
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => { setEditingPhone(!editingPhone); if (!editingPhone) setEditingEmail(false); }}
                      className="px-4 py-1.5 border border-cold-grey-light text-[10px] font-bold uppercase tracking-widest text-deep-black cursor-pointer shrink-0"
                    >
                      {editingPhone ? 'CANCEL' : 'CHANGE'}
                    </button>
                  </div>
                </div>

                <div className="border border-cold-grey-light p-4 focus-within:border-deep-black transition-colors">
                  <div className="flex justify-between items-center">
                    {editingEmail ? (
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="email@example.com"
                        className="w-full text-sm font-bold text-deep-black outline-none bg-transparent"
                        autoFocus
                      />
                    ) : (
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-cold-grey block mb-1">Email</span>
                        <span className="text-sm font-bold text-deep-black truncate max-w-[150px] inline-block">{form.email}</span>
                      </div>
                    )}
                    <button
                      onClick={() => { setEditingEmail(!editingEmail); if (!editingEmail) setEditingPhone(false); }}
                      className="px-4 py-1.5 border border-cold-grey-light text-[10px] font-bold uppercase tracking-widest text-deep-black cursor-pointer shrink-0"
                    >
                      {editingEmail ? 'CANCEL' : 'CHANGE'}
                    </button>
                  </div>
                </div>

                <div className="border border-cold-grey-light px-4 py-2 focus-within:border-deep-black transition-colors relative">
                  <label className="text-[10px] text-cold-grey absolute top-2 bg-pure-white px-1 -mt-4 uppercase font-bold tracking-widest">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full text-sm font-bold text-deep-black outline-none pt-2 bg-transparent"
                  />
                </div>

                <div className="flex border border-cold-grey-light">
                  {['Male', 'Female'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setForm({ ...form, gender: form.gender === g ? '' : g })}
                      className={`flex-1 py-3 text-sm font-bold transition-colors cursor-pointer ${
                        form.gender === g
                          ? 'bg-deep-black text-pure-white'
                          : 'text-deep-black border-r border-cold-grey-light hover:bg-cold-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>

                <div className="border border-cold-grey-light px-4 py-3 focus-within:border-deep-black transition-colors">
                  <input
                    type="date"
                    value={form.birthday}
                    onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                    className="w-full text-sm font-bold text-deep-black outline-none bg-transparent"
                  />
                </div>

                <h3 className="font-bold text-deep-black mt-6 mb-2">Alternate mobile details</h3>

                <div className="flex border border-cold-grey-light px-4 py-3 focus-within:border-deep-black transition-colors items-center gap-3">
                  <span className="text-cold-grey text-sm font-bold">+91</span>
                  <div className="w-px h-4 bg-cold-grey-light" />
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={form.alternatePhone}
                    onChange={(e) => setForm({ ...form, alternatePhone: e.target.value })}
                    className="w-full text-sm font-bold text-deep-black outline-none bg-transparent placeholder:text-cold-grey"
                  />
                </div>

                <div className="border border-cold-grey-light px-4 py-3 focus-within:border-deep-black transition-colors">
                  <input
                    type="text"
                    placeholder="Hint name"
                    value={form.hintName}
                    onChange={(e) => setForm({ ...form, hintName: e.target.value })}
                    className="w-full text-sm font-bold text-deep-black outline-none bg-transparent placeholder:text-cold-grey"
                  />
                </div>

                {/* Address Section */}
                <h3 className="font-bold text-deep-black mt-6 mb-2">Address</h3>

                <div className="border border-cold-grey-light px-4 py-3 focus-within:border-deep-black transition-colors">
                  <input
                    type="text"
                    placeholder="Address Line 1 (Street, Building)"
                    value={form.addressLine1}
                    onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                    className="w-full text-sm font-bold text-deep-black outline-none bg-transparent placeholder:text-cold-grey"
                  />
                </div>

                <div className="border border-cold-grey-light px-4 py-3 focus-within:border-deep-black transition-colors">
                  <input
                    type="text"
                    placeholder="Address Line 2 (Area, Landmark)"
                    value={form.addressLine2}
                    onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
                    className="w-full text-sm font-bold text-deep-black outline-none bg-transparent placeholder:text-cold-grey"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-cold-grey-light px-4 py-3 focus-within:border-deep-black transition-colors">
                    <input
                      type="text"
                      placeholder="City"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full text-sm font-bold text-deep-black outline-none bg-transparent placeholder:text-cold-grey"
                    />
                  </div>
                  <div className="border border-cold-grey-light px-4 py-3 focus-within:border-deep-black transition-colors">
                    <input
                      type="text"
                      placeholder="State"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      className="w-full text-sm font-bold text-deep-black outline-none bg-transparent placeholder:text-cold-grey"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-cold-grey-light px-4 py-3 focus-within:border-deep-black transition-colors">
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={form.pincode}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                      className="w-full text-sm font-bold text-deep-black outline-none bg-transparent placeholder:text-cold-grey"
                    />
                  </div>
                  <div className="border border-cold-grey-light px-4 py-3 focus-within:border-deep-black transition-colors">
                    <input
                      type="text"
                      placeholder="Country"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      className="w-full text-sm font-bold text-deep-black outline-none bg-transparent placeholder:text-cold-grey"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-cold-grey-light mt-6 flex flex-col gap-4">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={saving}
                    className="w-full py-4 text-sm font-bold uppercase tracking-widest text-[#ff3f6c] bg-pure-white border border-cold-grey-light cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    DELETE ACCOUNT
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-4 text-sm font-bold uppercase tracking-widest bg-[#ff3f6c] text-pure-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'SAVING...' : 'SAVE DETAILS'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <BottomMobileNav />
      </div>

      {/* ─── Coupon Redeem Modal ─── */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center" onClick={() => { setCouponModalOpen(false); setCouponMessage(null); }}>
          <div
            className="bg-pure-white w-full sm:max-w-md rounded-t-2xl sm:rounded-lg shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-cold-grey-light">
              <h3 className="text-base sm:text-lg font-bold text-deep-black">Redeem Coupon</h3>
              <button
                onClick={() => { setCouponModalOpen(false); setCouponMessage(null); }}
                className="text-2xl text-cold-grey hover:text-deep-black bg-transparent border-none p-0 cursor-pointer leading-none"
              >
                &times;
              </button>
            </div>

            <div className="px-4 sm:px-6 py-5 sm:py-6">
              {couponMessage && (
                <div className={`mb-4 px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold uppercase tracking-widest ${
                  couponMessage.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}>
                  {couponMessage.text}
                </div>
              )}

              {profile && (
                <div className="mb-4 px-3 sm:px-4 py-3 bg-cold-white border border-cold-grey-light flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs uppercase font-bold text-cold-grey tracking-widest">Your Balance</span>
                  <span className="text-base sm:text-lg font-bold text-deep-black">{profile.kalasatra_credits ?? 0} coins</span>
                </div>
              )}

              <label className="block text-[10px] sm:text-xs uppercase font-bold text-cold-grey tracking-widest mb-2">
                Enter Coupon Code
              </label>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. KALASATRA50"
                  className="w-full sm:flex-1 px-4 py-3 border border-cold-grey-light text-sm font-bold text-deep-black outline-none focus:border-deep-black transition-colors uppercase placeholder:normal-case"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRedeemCoupon(); }}
                />
                <button
                  onClick={handleRedeemCoupon}
                  disabled={redeeming || !couponCode.trim()}
                  className="w-full sm:w-auto px-6 py-3 bg-deep-black text-pure-white text-sm font-bold uppercase tracking-widest hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-none cursor-pointer"
                >
                  {redeeming ? '...' : 'Redeem'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
