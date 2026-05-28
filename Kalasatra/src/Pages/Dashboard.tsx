import { useState, useEffect } from 'react';
import { apiRequest, getTokens, setTokens, clearTokens } from '../utils/api';

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
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] py-8 px-4">
      <div className="max-w-2xl mx-auto bg-[#1C1C1C] rounded-2xl overflow-hidden">

        <div className="flex items-center justify-between gap-4 p-6 border-b border-[#333]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37] flex items-center justify-center text-lg font-bold text-[#0F0F0F] shrink-0">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#F5F5F5]">{profile?.name || 'Authorized User'}</h2>
              <p className="text-sm text-[#999]">{profile?.email || 'N/A'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-red-400 border border-red-800/50 rounded-lg hover:bg-red-900/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            Sign Out
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 px-4 py-3 bg-red-900/30 text-red-400 border border-red-800/50 rounded-lg text-sm">
            <span>{error}</span>
          </div>
        )}

        <div className="p-6 space-y-6">
          <div>
            <div className="text-sm font-semibold text-[#999] uppercase tracking-wider mb-4">Firestore User Profile</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'User ID (Cognito Sub)', value: profile?.uid || 'N/A' },
                { label: 'Phone Number', value: profile?.phone || 'Not Provided' },
                { label: 'Created At', value: profile?.createdAt ? new Date(profile.createdAt).toLocaleString() : 'N/A' },
                { label: 'Last Logged In', value: profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : 'First session' },
              ].map((item) => (
                <div key={item.label} className="bg-[#0F0F0F] rounded-xl px-4 py-3">
                  <div className="text-xs text-[#666] uppercase tracking-wider mb-1">{item.label}</div>
                  <div className="text-sm text-[#F5F5F5] break-all">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-[#999] uppercase tracking-wider mb-4">Cognito Token Inspector</div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-[#999]">Access Token (Authorization Bearer)</span>
                  <button
                    onClick={() => handleCopyToken(tokens.accessToken, 'access')}
                    className="text-[10px] font-medium text-[#D4AF37] hover:underline bg-transparent border-none cursor-pointer"
                  >
                    {copyStatus === 'access' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="max-h-20 overflow-y-auto bg-[#0F0F0F] rounded-lg px-3 py-2 text-xs text-[#666] break-all">
                  {tokens.accessToken || 'No access token available'}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-[#999]">Refresh Token (Session rotation)</span>
                  <button
                    onClick={() => handleCopyToken(tokens.refreshToken, 'refresh')}
                    className="text-[10px] font-medium text-[#D4AF37] hover:underline bg-transparent border-none cursor-pointer"
                  >
                    {copyStatus === 'refresh' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="max-h-20 overflow-y-auto bg-[#0F0F0F] rounded-lg px-3 py-2 text-xs text-[#666] break-all">
                  {tokens.refreshToken || 'No refresh token available'}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={handleManualRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-[#D4AF37] text-[#0F0F0F] text-sm font-medium rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer border-none"
              >
                {refreshing ? <span className="inline-block w-4 h-4 border-2 border-[#0F0F0F] border-t-transparent rounded-full animate-spin align-middle mr-2" /> : null}
                {refreshing ? 'Rotating...' : 'Force Rotate JWTs'}
              </button>
              <button
                onClick={fetchProfile}
                className="px-4 py-2 bg-transparent text-[#999] text-sm font-medium rounded-lg border border-[#333] hover:border-[#D4AF37] hover:text-[#F5F5F5] transition-all cursor-pointer"
              >
                Refresh Profile Data
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
