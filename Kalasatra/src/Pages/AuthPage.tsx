import { useState, useEffect } from 'react';
import { apiRequest, setTokens } from '../utils/api';
import {FaEye, FaEyeSlash} from "react-icons/fa";

interface AuthPageProps {
  onLoginSuccess: () => void;
}

type TabType = 'login' | 'signup' | 'forgot' | 'reset';

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [tab, setTab] = useState<TabType>('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string; list?: string[] } | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

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
    setNewPassword('');
    setOtpCode('');
  };

  const showMessage = (type: 'success' | 'error', text: string, list?: string[]) => {
    setMessage({ type, text, list });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const payload = {
      email,
      password,
      name,
      ...(phone ? { phone } : {}),
    };

    const res = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (res.success) {
      showMessage('success', res.message || 'Signup successful! OTP code sent to your email.');
      setOtpEmail(email);
      setIsVerifyingOtp(true);
      setResendTimer(60);
    } else {
      showMessage('error', res.message || 'Signup failed', res.errors);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: otpEmail || email,
        code: otpCode,
      }),
    });

    setLoading(false);
    if (res.success) {
      showMessage('success', 'Email verified successfully! You can now log in.');
      setIsVerifyingOtp(false);
      setTab('login');
      setPassword('');
      setOtpCode('');
    } else {
      showMessage('error', res.message || 'Verification failed');
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setMessage(null);

    const res = await apiRequest('/auth/resend-otp', {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);
    if (res.success && res.data) {
      const { accessToken, idToken, refreshToken } = res.data;
      setTokens(accessToken, idToken, refreshToken);
      onLoginSuccess();
    } else {
      showMessage('error', res.message || 'Login failed');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    setLoading(false);
    if (res.success) {
      showMessage('success', 'Password reset code has been sent to your email.');
      setTab('reset');
    } else {
      showMessage('error', res.message || 'Request failed');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        email,
        code: otpCode,
        newPassword,
      }),
    });

    setLoading(false);
    if (res.success) {
      showMessage('success', 'Password has been reset successfully. Please log in.');
      setTab('login');
      setPassword('');
      setNewPassword('');
      setOtpCode('');
    } else {
      showMessage('error', res.message || 'Password reset failed');
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <section className="relative min-h-svh flex items-center justify-center overflow-hidden bg-rich-black px-4 py-20">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(212,175,55,0.06),transparent_70%)]" />
        <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-luxury-gold/6 rounded-full blur-[120px]" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-luxury-gold/4 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-[480px] animate-fade-in-up">
        <div className="relative border border-luxury-gold/20 bg-dark-charcoal/90 backdrop-blur-xl p-8 sm:p-zz10 shadow-[0_0_60px_rgba(212,175,55,0.08)]">
          <div className="absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-luxury-gold/40 to-transparent" />
          <div className="absolute -bottom-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-luxury-gold/20 to-transparent" />

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-luxury-gold/10 border border-luxury-gold/30 mb-4">
              <span className="font-heading text-2xl font-black text-luxury-gold">K</span>
            </div>
            <h1 className="font-heading text-3xl font-bold text-soft-white tracking-tight">
              Kalasatra
            </h1>
            <p className="text-sm text-soft-white/50 mt-1 tracking-wider uppercase">
              Premium Streetwear
            </p>
          </div>

          {message && (
            <div
              className={`relative flex flex-col gap-1 px-4 py-3 mb-6 text-sm border ${
                message.type === 'error'
                  ? 'bg-red-950/30 border-red-500/25 text-red-400'
                  : 'bg-luxury-gold/8 border-luxury-gold/25 text-luxury-gold'
              }`}
            >
              <span>{message.text}</span>
              {message.list && message.list.length > 0 && (
                <ul className="list-disc pl-5 mt-1 space-y-0.5">
                  {message.list.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              )}
            </div>
          )}

          {isVerifyingOtp ? (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
              <div className="text-center space-y-3">
                <h3 className="font-heading text-xl font-bold text-soft-white">Verify Your Email</h3>
                <p className="text-sm text-soft-white/60">
                  We sent a 6-digit verification code to{' '}
                  <span className="text-luxury-gold font-semibold">{otpEmail || email}</span>
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-[0.15em] text-soft-white/60 font-semibold">
                  Verification OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  required
                  className="w-full px-5 py-3 bg-rich-black/80 border border-luxury-gold/20 text-soft-white text-center text-xl font-bold tracking-[8px] placeholder:text-soft-white/20 outline-none focus:border-luxury-gold/60 transition-all duration-300"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full px-10 py-3.5 bg-luxury-gold text-rich-black font-bold uppercase tracking-[0.2em] text-sm overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading && (
                    <span className="inline-block w-4 h-4 border-2 border-rich-black/30 border-t-rich-black rounded-full animate-spin" />
                  )}
                  {loading ? 'Confirming...' : 'Confirm Registration'}
                </span>
                <span className="absolute inset-0 bg-gold-light scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left disabled:scale-x-0" />
              </button>

              <div className="text-center text-sm text-soft-white/50">
                Didn't get the code?{' '}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading || resendTimer > 0}
                  className="text-luxury-gold font-semibold hover:text-gold-light transition-colors bg-transparent border-none p-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendTimer > 0 ? `Resend OTP (${resendTimer}s)` : 'Resend Code'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsVerifyingOtp(false)}
                className="w-full px-5 py-3 border border-luxury-gold/20 text-soft-white/70 font-semibold uppercase tracking-[0.15em] text-xs hover:border-luxury-gold/40 hover:text-luxury-gold transition-all duration-300 bg-transparent cursor-pointer"
              >
                Back to Auth Form
              </button>
            </form>
          ) : (
            <>
              {(tab === 'login' || tab === 'signup') && (
                <div className="flex p-1 mb-6 border border-luxury-gold/10 bg-rich-black/50">
                  <button
                    onClick={() => handleTabChange('login')}
                    className={`flex-1 py-2.5 text-sm font-semibold uppercase tracking-[0.15em] transition-all duration-500 cursor-pointer ${
                      tab === 'login'
                        ? 'bg-luxury-gold text-rich-black shadow-lg shadow-luxury-gold/20'
                        : 'text-soft-white/50 hover:text-soft-white bg-transparent'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleTabChange('signup')}
                    className={`flex-1 py-2.5 text-sm font-semibold uppercase tracking-[0.15em] transition-all duration-500 cursor-pointer ${
                      tab === 'signup'
                        ? 'bg-luxury-gold text-rich-black shadow-lg shadow-luxury-gold/20'
                        : 'text-soft-white/50 hover:text-soft-white bg-transparent'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {tab === 'login' && (
                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-[0.15em] text-soft-white/60 font-semibold">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-5 py-3 bg-rich-black/80 border border-luxury-gold/20 text-soft-white text-sm placeholder:text-soft-white/30 outline-none focus:border-luxury-gold/60 transition-all duration-300"
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

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-soft-white/50 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 accent-luxury-gold bg-rich-black border-luxury-gold/30" />
                      Remember me
                    </label>
                    <button
                      type="button"
                      onClick={() => handleTabChange('forgot')}
                      className="text-luxury-gold font-semibold hover:text-gold-light transition-colors bg-transparent border-none p-0 cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full px-10 py-3.5 bg-luxury-gold text-rich-black font-bold uppercase tracking-[0.2em] text-sm overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading && (
                        <span className="inline-block w-4 h-4 border-2 border-rich-black/30 border-t-rich-black rounded-full animate-spin" />
                      )}
                      {loading ? 'Logging in...' : 'Log In'}
                    </span>
                    <span className="absolute inset-0 bg-gold-light scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left disabled:scale-x-0" />
                  </button>

                 
                </form>
              )}

              {tab === 'signup' && (
                <form onSubmit={handleSignup} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-[0.15em] text-soft-white/60 font-semibold">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-5 py-3 bg-rich-black/80 border border-luxury-gold/20 text-soft-white text-sm placeholder:text-soft-white/30 outline-none focus:border-luxury-gold/60 transition-all duration-300"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-[0.15em] text-soft-white/60 font-semibold">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-5 py-3 bg-rich-black/80 border border-luxury-gold/20 text-soft-white text-sm placeholder:text-soft-white/30 outline-none focus:border-luxury-gold/60 transition-all duration-300"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-[0.15em] text-soft-white/60 font-semibold">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+919876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-5 py-3 bg-rich-black/80 border border-luxury-gold/20 text-soft-white text-sm placeholder:text-soft-white/30 outline-none focus:border-luxury-gold/60 transition-all duration-300"
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

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full px-10 py-3.5 bg-luxury-gold text-rich-black font-bold uppercase tracking-[0.2em] text-sm overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading && (
                        <span className="inline-block w-4 h-4 border-2 border-rich-black/30 border-t-rich-black rounded-full animate-spin" />
                      )}
                      {loading ? 'Creating...' : 'Create Account'}
                    </span>
                    <span className="absolute inset-0 bg-gold-light scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left disabled:scale-x-0" />
                  </button>
                </form>
              )}

              {tab === 'forgot' && (
                <form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
                  <div className="text-center space-y-2 mb-2">
                    <h3 className="font-heading text-lg font-bold text-soft-white">Forgot Password</h3>
                    <p className="text-sm text-soft-white/60">Enter your email and we'll send you an OTP to reset your password.</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-[0.15em] text-soft-white/60 font-semibold">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-5 py-3 bg-rich-black/80 border border-luxury-gold/20 text-soft-white text-sm placeholder:text-soft-white/30 outline-none focus:border-luxury-gold/60 transition-all duration-300"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full px-10 py-3.5 bg-luxury-gold text-rich-black font-bold uppercase tracking-[0.2em] text-sm overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading && (
                        <span className="inline-block w-4 h-4 border-2 border-rich-black/30 border-t-rich-black rounded-full animate-spin" />
                      )}
                      {loading ? 'Sending...' : 'Send Reset Code'}
                    </span>
                    <span className="absolute inset-0 bg-gold-light scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left disabled:scale-x-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabChange('login')}
                    className="w-full px-5 py-3 border border-luxury-gold/20 text-soft-white/70 font-semibold uppercase tracking-[0.15em] text-xs hover:border-luxury-gold/40 hover:text-luxury-gold transition-all duration-300 bg-transparent cursor-pointer"
                  >
                    Back to Login
                  </button>
                </form>
              )}

              {tab === 'reset' && (
                <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
                  <div className="text-center space-y-2 mb-2">
                    <h3 className="font-heading text-lg font-bold text-soft-white">Reset Password</h3>
                    <p className="text-sm text-soft-white/60">Enter the code sent to your email and your new password.</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-[0.15em] text-soft-white/60 font-semibold">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-5 py-3 bg-rich-black/80 border border-luxury-gold/20 text-soft-white text-sm placeholder:text-soft-white/30 outline-none focus:border-luxury-gold/60 transition-all duration-300"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-[0.15em] text-soft-white/60 font-semibold">
                      Reset OTP Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      required
                      className="w-full px-5 py-3 bg-rich-black/80 border border-luxury-gold/20 text-soft-white text-sm placeholder:text-soft-white/30 outline-none focus:border-luxury-gold/60 transition-all duration-300"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-[0.15em] text-soft-white/60 font-semibold">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full px-5 py-3 bg-rich-black/80 border border-luxury-gold/20 text-soft-white text-sm placeholder:text-soft-white/30 outline-none focus:border-luxury-gold/60 transition-all duration-300"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full px-10 py-3.5 bg-luxury-gold text-rich-black font-bold uppercase tracking-[0.2em] text-sm overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading && (
                        <span className="inline-block w-4 h-4 border-2 border-rich-black/30 border-t-rich-black rounded-full animate-spin" />
                      )}
                      {loading ? 'Updating...' : 'Update Password'}
                    </span>
                    <span className="absolute inset-0 bg-gold-light scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left disabled:scale-x-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabChange('login')}
                    className="w-full px-5 py-3 border border-luxury-gold/20 text-soft-white/70 font-semibold uppercase tracking-[0.15em] text-xs hover:border-luxury-gold/40 hover:text-luxury-gold transition-all duration-300 bg-transparent cursor-pointer"
                  >
                    Back to Login
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        <div className="absolute -bottom-4 -left-4 right-10 h-px bg-gradient-to-r from-luxury-gold/20 via-luxury-gold/10 to-transparent pointer-events-none" />
        <div className="absolute -top-4 -right-4 bottom-10 w-px bg-gradient-to-b from-luxury-gold/20 via-luxury-gold/10 to-transparent pointer-events-none" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-luxury-gold/20 to-transparent" />
    </section>
  );
}
