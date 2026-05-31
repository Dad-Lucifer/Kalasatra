import { useState, useEffect } from 'react';
import { apiRequest, setTokens } from '../utils/api';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface AdminAuthPageProps {
  onLoginSuccess: () => void;
}

type TabType = 'login' | 'signup';

export default function AdminAuthPage({ onLoginSuccess }: AdminAuthPageProps) {
  const [tab, setTab] = useState<TabType>('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string; list?: string[] } | null>(null);

  // Forms state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // OTP verification sub-view
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Handle Resend OTP Timer
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const handleTabChange = (newTab: TabType) => {
    setTab(newTab);
    setMessage(null);
    setPassword('');
    setOtpCode('');
  };

  const showMessage = (type: 'success' | 'error', text: string, list?: string[]) => {
    setMessage({ type, text, list });
  };

  // 1. ADMIN SIGNUP REQUEST
  const handleAdminSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const payload = {
      email,
      password,
      name,
      ...(phone ? { phone } : {}),
    };

    const res = await apiRequest('/admin/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (res.success) {
      showMessage('success', res.message || 'Admin account created! OTP code sent to your email.');
      setOtpEmail(email);
      setIsVerifyingOtp(true);
      setResendTimer(60);
    } else {
      showMessage('error', res.message || 'Signup failed', res.errors);
    }
  };

  // 2. VERIFY OTP REQUEST
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await apiRequest('/admin/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: otpEmail || email,
        code: otpCode,
      }),
    });

    setLoading(false);
    if (res.success) {
      showMessage('success', 'Email verified successfully! Admin account activated. You can now log in.');
      setIsVerifyingOtp(false);
      setTab('login');
      setPassword('');
      setOtpCode('');
    } else {
      showMessage('error', res.message || 'Verification failed');
    }
  };

  // 3. RESEND OTP
  const handleResendOtp = async () => {
    setLoading(true);
    setMessage(null);

    const res = await apiRequest('/admin/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email: otpEmail || email }),
    });

    setLoading(false);
    if (res.success) {
      showMessage('success', 'A new OTP confirmation code has been sent to your email.');
      setResendTimer(60);
    } else {
      showMessage('error', res.message || 'Failed to resend code');
    }
  };

  // 4. ADMIN LOGIN REQUEST
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await apiRequest('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);
    if (res.success && res.data) {
      const { accessToken, idToken, refreshToken, user } = res.data;
      setTokens(accessToken, idToken, refreshToken);

      // Store admin user info
      localStorage.setItem('adminUser', JSON.stringify(user));

      showMessage('success', `Welcome back, ${user.name}! Role: ${user.role}`);
      setTimeout(() => onLoginSuccess(), 1500);
    } else {
      showMessage('error', res.message || 'Admin login failed');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  }

  return (
    <div className="min-h-screen bg-rich-black flex items-center justify-center px-4 py-10">
      <div className="w-full  bg-dark-charcoal rounded-2xl p-8 animate-fade-in">

        <div className="text-center mb-8">
          <div className="text-3xl mb-2">🛡️ Admin Portal</div>
          <div className="text-sm text-[#999]">Kalasatra Admin Authentication</div>
        </div>

        {message && (
          <div className={`mb-5 px-4 py-3 rounded-lg text-sm ${message.type === 'success'
              ? 'bg-green-900/30 text-green-400 border border-green-800/50'
              : 'bg-red-900/30 text-red-400 border border-red-800/50'
            }`}>
            <span>{message.text}</span>
            {message.list && message.list.length > 0 && (
              <ul className="mt-2 space-y-1 list-disc list-inside">
                {message.list.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            )}
          </div>
        )}

        {isVerifyingOtp ? (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-[#F5F5F5]">Verify Your Admin Email</h3>
              <p className="text-sm text-[#999]">
                We sent a 6-digit verification code to <strong className="text-[#D4AF37]">{otpEmail || email}</strong>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#999]">Verification OTP Code</label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                className="w-full px-3 py-2.5 bg-[#0F0F0F] border border-[#333] rounded-lg text-[#F5F5F5] text-lg text-center tracking-[8px] font-bold outline-none focus:border-[#D4AF37] transition-colors"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>

            <button type="submit" className="w-full px-6 py-3 bg-[#D4AF37] text-[#0F0F0F] text-sm font-semibold rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer border-none" disabled={loading}>
              {loading ? <span className="inline-block w-4 h-4 border-2 border-[#0F0F0F] border-t-transparent rounded-full animate-spin align-middle mr-2" /> : null}
              {loading ? 'Verifying...' : 'Confirm Admin Registration'}
            </button>

            <div className="text-center text-sm text-[#999]">
              Didn't get the code?{' '}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading || resendTimer > 0}
                className="bg-transparent border-none text-[#D4AF37] hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendTimer > 0 ? `Resend OTP (${resendTimer}s)` : 'Resend Code'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsVerifyingOtp(false)}
              className="w-full px-6 py-2.5 bg-transparent text-[#999] text-sm font-medium rounded-lg border border-[#333] hover:border-[#D4AF37] hover:text-[#F5F5F5] transition-all cursor-pointer"
            >
              Back to Auth Form
            </button>
          </form>
        ) : (
          <>
            <div className="flex rounded-lg overflow-hidden border border-[#333] mb-6">
              <button
                onClick={() => handleTabChange('login')}
                className={`flex-1 py-2.5 text-sm font-medium transition-all cursor-pointer border-none ${tab === 'login'
                    ? 'bg-[#D4AF37] text-[#0F0F0F]'
                    : 'bg-transparent text-[#999] hover:text-[#F5F5F5]'
                  }`}
              >
                Admin Login
              </button>
              <button
                onClick={() => handleTabChange('signup')}
                className={`flex-1 py-2.5 text-sm font-medium transition-all cursor-pointer border-none ${tab === 'signup'
                    ? 'bg-[#D4AF37] text-[#0F0F0F]'
                    : 'bg-transparent text-[#999] hover:text-[#F5F5F5]'
                  }`}
              >
                Admin Signup
              </button>
            </div>

            {tab === 'login' && (
              <form onSubmit={handleAdminLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#999]">Admin Email Address</label>
                  <input
                    type="email"
                    placeholder="admin@example.com"
                    className="w-full px-3 py-2.5 bg-[#0F0F0F] border border-[#333] rounded-lg text-[#F5F5F5] text-sm placeholder-[#666] outline-none focus:border-[#D4AF37] transition-colors"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

               <div className="flex flex-col gap-2 relative">
                    <label className="text-xs uppercase tracking-[0.15em] text-soft-white/60 font-semibold">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-5 py-3 pr-12 bg-rich-black/80 border border-luxury-gold/20 text-soft-white text-sm placeholder:text-soft-white/30 outline-none focus:border-luxury-gold/60 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-soft-white/50 hover:text-luxury-gold transition-colors bg-transparent border-none p-0 cursor-pointer"
                      >
                        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                  </div>
                <button type="submit" className="w-full px-6 py-3 bg-[#D4AF37] text-[#0F0F0F] text-sm font-semibold rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer border-none" disabled={loading}>
                  {loading ? <span className="inline-block w-4 h-4 border-2 border-[#0F0F0F] border-t-transparent rounded-full animate-spin align-middle mr-2" /> : null}
                  {loading ? 'Logging in...' : '🔐 Admin Login'}
                </button>

                <p className="text-center text-xs text-[#999]">
                  If your admin account isn't confirmed yet,{' '}
                  <span
                    onClick={() => {
                      setOtpEmail(email);
                      setIsVerifyingOtp(true);
                    }}
                    className="text-[#D4AF37] hover:underline cursor-pointer"
                  >
                    verify code here
                  </span>
                </p>

                <div className="mt-5 p-3 bg-blue-950/30 border border-blue-900/30 rounded-xl text-xs text-[#999]">
                  <strong>ℹ️ Note:</strong> Only users with the Admin role can access this portal.
                </div>
              </form>
            )}

            {tab === 'signup' && (
              <form onSubmit={handleAdminSignup} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#999]">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-3 py-2.5 bg-[#0F0F0F] border border-[#333] rounded-lg text-[#F5F5F5] text-sm placeholder-[#666] outline-none focus:border-[#D4AF37] transition-colors"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#999]">Email Address</label>
                  <input
                    type="email"
                    placeholder="admin@example.com"
                    className="w-full px-3 py-2.5 bg-[#0F0F0F] border border-[#333] rounded-lg text-[#F5F5F5] text-sm placeholder-[#666] outline-none focus:border-[#D4AF37] transition-colors"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#999]">Phone Number (Optional, E.164 format)</label>
                  <input
                    type="tel"
                    placeholder="+919876543210"
                    className="w-full px-3 py-2.5 bg-[#0F0F0F] border border-[#333] rounded-lg text-[#F5F5F5] text-sm placeholder-[#666] outline-none focus:border-[#D4AF37] transition-colors"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2 relative">
                    <label className="text-xs uppercase tracking-[0.15em] text-soft-white/60 font-semibold">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-5 py-3 pr-12 bg-rich-black/80 border border-luxury-gold/20 text-soft-white text-sm placeholder:text-soft-white/30 outline-none focus:border-luxury-gold/60 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-soft-white/50 hover:text-luxury-gold transition-colors bg-transparent border-none p-0 cursor-pointer"
                      >
                        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                    <p className="text-[11px] text-soft-white/40 mt-1">
                      Min 8 characters. Must contain uppercase, lowercase, number, and special character.
                    </p>
                  </div>

                <button type="submit" className="w-full px-6 py-3 bg-[#D4AF37] text-[#0F0F0F] text-sm font-semibold rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer border-none" disabled={loading}>
                  {loading ? <span className="inline-block w-4 h-4 border-2 border-[#0F0F0F] border-t-transparent rounded-full animate-spin align-middle mr-2" /> : null}
                  {loading ? 'Creating...' : '✨ Create Admin Account'}
                </button>

                <div className="p-3 bg-blue-950/30 border border-blue-900/30 rounded-xl text-xs text-[#999]">
                  <strong>ℹ️ Note:</strong> All admin accounts will be assigned the "Admin" role after email verification.
                </div>
              </form>
            )}
          </>
        )}

      </div>
    </div>
  );
}
