import { useState, useEffect } from 'react';
import AuthPage from './Pages/AuthPage';
import Dashboard from './Pages/Dashboard';
import AdminAuthPage from './Pages/AdminAuthPage';
import AdminDashboard from './Pages/AdminDashboard';
import './App.css';

type AppMode = 'user' | 'admin';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [mode, setMode] = useState<AppMode>('user');

  // Check login state on startup
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const adminUser = localStorage.getItem('adminUser');
    
    setIsAuthenticated(!!token);
    
    // Auto-detect mode based on stored admin user
    if (adminUser) {
      setMode('admin');
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogoutSuccess = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminUser');
  };

  const toggleMode = () => {
    setMode(mode === 'user' ? 'admin' : 'user');
    setIsAuthenticated(false);
    localStorage.clear();
  };

  if (isAuthenticated === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <>
      <header style={{ padding: '20px 40px', borderBottom: '1px solid var(--border)', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '20px', letterSpacing: '-0.5px', color: 'var(--text-h)' }}>
            Kalasatra
          </div>
          <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--accent)', padding: '2px 8px', borderRadius: '20px', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}>
            Backend Active
          </span>
          {mode === 'admin' && (
            <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#ef4444', padding: '2px 8px', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              🛡️ Admin Mode
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={toggleMode}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text-h)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {mode === 'user' ? '🛡️ Switch to Admin' : '👤 Switch to User'}
          </button>
          <div style={{ fontSize: '14px', color: 'var(--text)', opacity: 0.8 }}>
            AWS Cognito + Cloud Firestore
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {mode === 'admin' ? (
          isAuthenticated ? (
            <AdminDashboard />
          ) : (
            <AdminAuthPage onLoginSuccess={handleLoginSuccess} />
          )
        ) : (
          isAuthenticated ? (
            <Dashboard onLogout={handleLogoutSuccess} />
          ) : (
            <AuthPage onLoginSuccess={handleLoginSuccess} />
          )
        )}
      </main>

      <footer style={{ padding: '24px 0', borderTop: '1px solid var(--border)', fontSize: '13px', opacity: 0.7 }}>
        &copy; {new Date().getFullYear()} Kalasatra Studio. All rights reserved. Powered by AWS Cognito & Google Firestore.
      </footer>
    </>
  );
}

export default App;
