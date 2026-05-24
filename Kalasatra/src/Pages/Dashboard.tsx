import { useState, useEffect } from 'react';
import { apiRequest, getTokens, setTokens, clearTokens } from '../utils/api';
import './Dashboard.css';

interface DashboardProps {
  onLogout: () => void;
}

interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const tokens = getTokens();

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    const res = await apiRequest<{ user: UserProfile }>('/auth/me');
    setLoading(false);

    if (res.success && res.data) {
      setProfile(res.data.user);
    } else {
      setError(res.message || 'Failed to fetch user profile.');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    // Call server to invalidate tokens
    await apiRequest('/auth/logout', { method: 'POST' });
    clearTokens();
    setLoading(false);
    onLogout();
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    setError(null);
    const { refreshToken } = getTokens();

    if (!refreshToken) {
      setError('No refresh token available.');
      setRefreshing(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setTokens(data.data.accessToken, data.data.idToken);
        setError(null);
        alert('Token rotated and updated in storage successfully!');
      } else {
        setError(data.message || 'Refresh failed. Session might be invalid.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error during token refresh.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCopyToken = (token: string | null, type: string) => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopyStatus(type);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  if (loading && !profile) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--accent)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card animate-fade-in">
        
        {/* Header with avatar info */}
        <div className="dashboard-header">
          <div className="user-badge">
            <div className="avatar">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-meta">
              <h2>{profile?.name || 'Authorized User'}</h2>
              <p>{profile?.email || 'N/A'}</p>
            </div>
          </div>
          <button className="auth-btn logout-btn" onClick={handleLogout} disabled={loading}>
            Sign Out
          </button>
        </div>

        {/* Errors if any */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '24px' }}>
            <span>{error}</span>
          </div>
        )}

        {/* Firestore profile data */}
        <div className="dashboard-section">
          <div className="section-title">Firestore User Profile</div>
          <div className="info-grid">
            <div className="info-tile">
              <div className="tile-label">User ID (Cognito Sub)</div>
              <div className="tile-value">{profile?.uid || 'N/A'}</div>
            </div>
            <div className="info-tile">
              <div className="tile-label">Phone Number</div>
              <div className="tile-value">{profile?.phone || 'Not Provided'}</div>
            </div>
            <div className="info-tile">
              <div className="tile-label">Created At</div>
              <div className="tile-value">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleString() : 'N/A'}
              </div>
            </div>
            <div className="info-tile">
              <div className="tile-label">Last Logged In</div>
              <div className="tile-value">
                {profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : 'First session'}
              </div>
            </div>
          </div>
        </div>

        {/* Security Token Inspector */}
        <div className="dashboard-section">
          <div className="section-title">Cognito Token Inspector</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Access Token */}
            <div className="token-container">
              <div className="token-header">
                <span className="input-label" style={{ margin: 0 }}>Access Token (Authorization Bearer)</span>
                <button 
                  className="copy-btn" 
                  onClick={() => handleCopyToken(tokens.accessToken, 'access')}
                >
                  {copyStatus === 'access' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="token-scroller">
                {tokens.accessToken || 'No access token available'}
              </div>
            </div>

            {/* Refresh Token */}
            <div className="token-container">
              <div className="token-header">
                <span className="input-label" style={{ margin: 0 }}>Refresh Token (Session rotation)</span>
                <button 
                  className="copy-btn" 
                  onClick={() => handleCopyToken(tokens.refreshToken, 'refresh')}
                >
                  {copyStatus === 'refresh' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="token-scroller">
                {tokens.refreshToken || 'No refresh token available'}
              </div>
            </div>
          </div>

          <div className="action-row">
            <button className="auth-btn refresh-btn" onClick={handleManualRefresh} disabled={refreshing}>
              {refreshing ? <div className="spinner" style={{ borderTopColor: 'var(--accent)' }} /> : 'Force Rotate JWTs'}
            </button>
            <button className="secondary-btn" onClick={fetchProfile}>
              Refresh Profile Data
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
