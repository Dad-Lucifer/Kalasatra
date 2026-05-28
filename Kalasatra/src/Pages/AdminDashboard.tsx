import { useEffect, useState } from 'react';
import { apiRequest, clearTokens } from '../utils/api';
import ProductsPage from './ProductsPage';
import './Dashboard.css';

interface AdminUser {
  sub: string;
  email: string;
  name: string;
  role: string;
  groups: string[];
}

export default function AdminDashboard() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products'>('dashboard');

  useEffect(() => {
    loadAdminProfile();
  }, []);

  const loadAdminProfile = async () => {
    setLoading(true);
    
    // Try to get from localStorage first
    const storedUser = localStorage.getItem('adminUser');
    if (storedUser) {
      setAdminUser(JSON.parse(storedUser));
    }

    // Fetch fresh data from API
    const res = await apiRequest('/admin/me');
    setLoading(false);

    if (res.success && res.data) {
      setAdminUser({
        sub: res.data.uid,
        email: res.data.email,
        name: res.data.name,
        role: res.data.role,
        groups: res.data.groups || [],
      });
      localStorage.setItem('adminUser', JSON.stringify(res.data));
    }
  };

  const handleLogout = () => {
    clearTokens();
    localStorage.removeItem('adminUser');
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-card">
          <div className="spinner" style={{ margin: '40px auto' }} />
          <p style={{ textAlign: 'center', color: 'var(--text)' }}>Loading admin profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card animate-fade-in">
        
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">🛡️ Admin Dashboard</h1>
            <p className="dashboard-subtitle">Welcome to the admin control panel</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <nav style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: activeTab === 'dashboard' ? 'var(--accent)' : 'var(--bg)',
                  color: activeTab === 'dashboard' ? 'white' : 'var(--text)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Dashboard
              </button>
              <button 
                className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: activeTab === 'products' ? 'var(--accent)' : 'var(--bg)',
                  color: activeTab === 'products' ? 'white' : 'var(--text)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Products
              </button>
            </nav>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && adminUser && (
          <div className="profile-section">
            <div className="profile-card">
              <div className="profile-avatar">
                {adminUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="profile-info">
                <h2 className="profile-name">{adminUser.name}</h2>
                <p className="profile-email">{adminUser.email}</p>
                <div className="profile-badges">
                  <span className="badge badge-admin">{adminUser.role}</span>
                  {adminUser.groups.map((group) => (
                    <span key={group} className="badge badge-group">{group}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-card">
                <div className="info-label">User ID</div>
                <div className="info-value">{adminUser.sub}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Email</div>
                <div className="info-value">{adminUser.email}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Role</div>
                <div className="info-value">{adminUser.role}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Groups</div>
                <div className="info-value">{adminUser.groups.join(', ') || 'None'}</div>
              </div>
            </div>

            <div className="admin-features">
              <h3 style={{ marginBottom: '16px', color: 'var(--text-h)' }}>Admin Features</h3>
              <div className="feature-grid">
                <div className="feature-card" onClick={() => setActiveTab('products')} style={{ cursor: 'pointer' }}>
                  <div className="feature-icon">🛍️</div>
                  <h4>Product Management</h4>
                  <p>Manage products, categories, and inventory</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">👥</div>
                  <h4>User Management</h4>
                  <p>Manage user accounts and permissions</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">📊</div>
                  <h4>Analytics</h4>
                  <p>View system analytics and reports</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">⚙️</div>
                  <h4>Settings</h4>
                  <p>Configure system settings</p>
                </div>
              </div>
            </div>

            <div style={{ 
              marginTop: '24px', 
              padding: '16px', 
              background: 'rgba(16, 185, 129, 0.08)', 
              borderRadius: '12px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <strong style={{ color: '#10b981' }}>✅ Admin Authentication Successful!</strong>
              <p style={{ marginTop: '8px', fontSize: '14px', color: 'var(--text)' }}>
                Your admin account is verified and active. You have <strong>{adminUser.role}</strong> level access.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div style={{ marginTop: '20px' }}>
            <ProductsPage isAdminMode={true} />
          </div>
        )}

      </div>
    </div>
  );
}
