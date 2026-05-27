import React, { useState, useEffect } from 'react';
import { apiRequest, setTokens } from '../utils/api';
import './AuthPage.css';

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

  // RENDER INTERFACE
  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in">
        
        <div className="auth-header">
          <div className="auth-logo">🛡️ Admin Portal</div>
          <div className="auth-subtitle">Kalasatra Admin Authentication</div>
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

        {/* View 1: OTP Verification View */}
        {isVerifyingOtp ? (
          <form className="auth-form" onSubmit={handleVerifyOtp}>
            <div className="otp-container">
              <h3>Verify Your Admin Email</h3>
              <p className="auth-subtitle">
                We sent a 6-digit verification code to <strong>{otpEmail || email}</strong>
              </p>
              
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
                {loading ? <div className="spinner" /> : 'Confirm Admin Registration'}
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
          /* View 2: Login/Signup Forms */
          <>
            {/* Tabs */}
            <div className="auth-tabs">
              <button
                className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
                onClick={() => handleTabChange('login')}
              >
                Admin Login
              </button>
              <button
                className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
                onClick={() => handleTabChange('signup')}
              >
                Admin Signup
              </button>
            </div>

            {/* ADMIN LOGIN FORM */}
            {tab === 'login' && (
              <form className="auth-form" onSubmit={handleAdminLogin}>
                <div className="input-group">
                  <label className="input-label">Admin Email Address</label>
                  <input
                    type="email"
                    placeholder="admin@example.com"
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

                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? <div className="spinner" /> : '🔐 Admin Login'}
                </button>
                
                <p className="auth-subtitle" style={{ textAlign: 'center', fontSize: '13px', marginTop: '12px' }}>
                  If your admin account isn't confirmed yet,{' '}
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

                <div style={{ 
                  marginTop: '20px', 
                  padding: '12px', 
                  background: 'rgba(59, 130, 246, 0.08)', 
                  borderRadius: '12px',
                  fontSize: '13px',
                  color: 'var(--text)'
                }}>
                  <strong>ℹ️ Note:</strong> Only users with the Admin role can access this portal.
                </div>
              </form>
            )}

            {/* ADMIN SIGNUP FORM */}
            {tab === 'signup' && (
              <form className="auth-form" onSubmit={handleAdminSignup}>
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
                    placeholder="admin@example.com"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Phone Number (Optional, E.164 format)</label>
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
                  {loading ? <div className="spinner" /> : '✨ Create Admin Account'}
                </button>

                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px', 
                  background: 'rgba(59, 130, 246, 0.08)', 
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: 'var(--text)',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
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
