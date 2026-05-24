import { useState, useEffect } from 'react';
import AuthPage from './Pages/AuthPage';
import Dashboard from './Pages/Dashboard';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check login state on startup
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogoutSuccess = () => {
    setIsAuthenticated(false);
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
        <div style={{ fontWeight: 'bold', fontSize: '20px', letterSpacing: '-0.5px', color: 'var(--text-h)' }}>
          Kalasatra <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--accent)', marginLeft: '8px', padding: '2px 8px', borderRadius: '20px', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}>Backend Active</span>
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text)', opacity: 0.8 }}>
          AWS Cognito + Cloud Firestore Authentication Tester
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {isAuthenticated ? (
          <Dashboard onLogout={handleLogoutSuccess} />
        ) : (
          <AuthPage onLoginSuccess={handleLoginSuccess} />
        )}
      </main>

      <footer style={{ padding: '24px 0', borderTop: '1px solid var(--border)', fontSize: '13px', opacity: 0.7 }}>
        &copy; {new Date().getFullYear()} Kalasatra Studio. All rights reserved. Powered by AWS Cognito & Google Firestore.
      </footer>
    </>
  );
}

export default App;
