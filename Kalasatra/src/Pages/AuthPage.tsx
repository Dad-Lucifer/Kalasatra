import React, { useState, useEffect } from 'react';
import { apiRequest, setTokens } from '../utils/api';
import './AuthPage.css';

interface AuthPageProps {
  onLoginSuccess: () => void;
}

type TabType = 'login' | 'signup' | 'forgot' | 'reset';

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [tab, setTab] = useState<TabType>('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string; list?: string[] } | null>(null);
  
  // Forms state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Verification verification sub-view
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
    // Clear passwords but retain email for better UX
    setPassword('');
    setNewPassword('');
    setOtpCode('');
  };

  const showMessage = (type: 'success' | 'error', text: string, list?: string[]) => {
    setMessage({ type, text, list });
  };

  // 1. SIGNUP REQUEST
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
      setResendTimer(60); // 60 seconds timer
    } else {
      showMessage('error', res.message || 'Signup failed', res.errors);
    }
  };

  // 2. VERIFY OTP REQUEST
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

  // 3. RESEND OTP
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

  // 4. LOGIN REQUEST
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

  // 5. FORGOT PASSWORD REQUEST
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

  // 6. RESET PASSWORD REQUEST
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

  // RENDER INTERFACE
  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in">
        
        <div className="auth-header">
          <div className="auth-logo">Kalasatra</div>
          <div className="auth-subtitle">Backend Authentication Tester</div>
        </div>

        {/* Success/Error Alerts */}
        {message && (
          <div className={`alert alert-${message.type}`} style={{ marginBottom: '20px' }}>
            <span>{message.text}</span>
            {message.list && message.list.length > 0 && (
              <ul className="alert-list">
                {message.list.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            )}
          </div>
        )}

        {/* View 1: Confirm OTP Registration View */}
        {isVerifyingOtp ? (
          <form className="auth-form" onSubmit={handleVerifyOtp}>
            <div className="otp-container">
              <h3>Verify Your Email</h3>
              <p className="auth-subtitle">We sent a 6-digit verification code to <strong>{otpEmail || email}</strong></p>
              
              <div className="input-group">
                <label className="input-label">Verification OTP Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  className="input-field"
                  style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '8px', fontWeight: 'bold' }}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>

              <button type="submit" className="auth-btn" style={{ width: '100%' }} disabled={loading}>
                {loading ? <div className="spinner" /> : 'Confirm Registration'}
              </button>

              <div className="otp-footer">
                Didn't get the code?{' '}
                <button
                  type="button"
                  className="resend-link"
                  onClick={handleResendOtp}
                  disabled={loading || resendTimer > 0}
                >
                  {resendTimer > 0 ? `Resend OTP (${resendTimer}s)` : 'Resend Code'}
                </button>
              </div>

              <button
                type="button"
                className="secondary-btn"
                style={{ width: '100%', marginTop: '8px' }}
                onClick={() => setIsVerifyingOtp(false)}
              >
                Back to Auth Form
              </button>
            </div>
          </form>
        ) : (
          /* View 2: Regular auth Forms (Login, Sign-up, Forgot, Reset) */
          <>
            {/* Tabs (only shown for login/signup) */}
            {(tab === 'login' || tab === 'signup') && (
              <div className="auth-tabs">
                <button
                  className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
                  onClick={() => handleTabChange('login')}
                >
                  Login
                </button>
                <button
                  className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
                  onClick={() => handleTabChange('signup')}
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* LOGIN FORM */}
            {tab === 'login' && (
              <form className="auth-form" onSubmit={handleLogin}>
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="input-group">
                  <label className="input-label">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-actions">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" style={{ accentColor: 'var(--accent)' }} />
                    Remember me
                  </label>
                  <span className="forgot-link" onClick={() => handleTabChange('forgot')}>
                    Forgot Password?
                  </span>
                </div>

                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? <div className="spinner" /> : 'Log In'}
                </button>
                
                <p className="auth-subtitle" style={{ textAlign: 'center', fontSize: '13px', marginTop: '12px' }}>
                  If your account isn't confirmed yet,{' '}
                  <span 
                    className="forgot-link" 
                    onClick={() => {
                      setOtpEmail(email);
                      setIsVerifyingOtp(true);
                    }}
                  >
                    verify code here
                  </span>
                </p>
              </form>
            )}

            {/* SIGNUP FORM */}
            {tab === 'signup' && (
              <form className="auth-form" onSubmit={handleSignup}>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="input-field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Phone Number (E.164 standard)</label>
                  <input
                    type="tel"
                    placeholder="+919876543210"
                    className="input-field"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <small style={{ fontSize: '11px', opacity: 0.7, color: 'var(--text)' }}>
                    Min 8 characters. Must contain uppercase, lowercase, number, and special character.
                  </small>
                </div>

                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? <div className="spinner" /> : 'Create Account'}
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {tab === 'forgot' && (
              <form className="auth-form" onSubmit={handleForgotPassword}>
                <h3>Forgot Password</h3>
                <p className="auth-subtitle">Enter your email and we'll send you an OTP to reset your password.</p>

                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? <div className="spinner" /> : 'Send Reset Code'}
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => handleTabChange('login')}
                >
                  Back to Login
                </button>
              </form>
            )}

            {/* RESET PASSWORD FORM */}
            {tab === 'reset' && (
              <form className="auth-form" onSubmit={handleResetPassword}>
                <h3>Reset Password</h3>
                <p className="auth-subtitle">Enter the code sent to your email and your new password.</p>

                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Reset OTP Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    className="input-field"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="input-field"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? <div className="spinner" /> : 'Update Password'}
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => handleTabChange('login')}
                >
                  Back to Login
                </button>
              </form>
            )}
          </>
        )}

      </div>
    </div>
  );
}
