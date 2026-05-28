import { useState, useEffect } from 'react';
import AuthPage from './Pages/AuthPage';
import Dashboard from './Pages/Dashboard';
import AdminAuthPage from './Pages/AdminAuthPage';
import AdminDashboard from './Pages/AdminDashboard';
import LandingPage from './Pages/LandingPage';
import './App.css';
import Navbar from './components/landing/Navbar';

type AppMode = 'user' | 'admin';
type Page = 'landing' | 'auth' | 'dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [mode, setMode] = useState<AppMode>('user');
  const [page, setPage] = useState<Page>('landing');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const adminUser = localStorage.getItem('adminUser');

    setIsAuthenticated(!!token);

    if (adminUser) {
      setMode('admin');
    }

    if (token) {
      setPage('dashboard');
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setPage('dashboard');
  };

  const handleLogoutSuccess = () => {
    setIsAuthenticated(false);
    setPage('landing');
    localStorage.removeItem('adminUser');
  };

  if (isAuthenticated === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--accent)' }} />
      </div>
    );
  }

  if (page === 'landing') {
    return <LandingPage onAuthClick={() => setPage('auth')} onHomeClick={() => setPage('landing')} />;
  }

  return (
    <>
      
      <Navbar onAuthClick={() => setPage('auth')} onHomeClick={() => setPage('landing')} />
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

    
    </>
  );
}

export default App;
