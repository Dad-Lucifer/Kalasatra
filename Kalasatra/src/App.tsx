import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AuthPage from './Pages/AuthPage';
import Dashboard from './Pages/Dashboard';
import AdminAuthPage from './Pages/AdminAuthPage';
import AdminDashboard from './Pages/AdminDashboard';
import LandingPage from './Pages/LandingPage';
import './App.css';

function App() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate('/dashboard');
  };

  const handleAdminLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate('/admin/dashboard');
  };

  const handleLogoutSuccess = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminUser');
    navigate('/');
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-rich-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-luxury-gold/30 border-t-luxury-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage onLoginSuccess={handleLoginSuccess} />} />
      <Route path='/ownerauth' element={<AdminAuthPage onLoginSuccess={handleAdminLoginSuccess} />} />
      <Route
        path="/dashboard"
        element={isAuthenticated ? <Dashboard onLogout={handleLogoutSuccess} /> : <Navigate to="/auth" />}
      />
      <Route path="/admin" element={<AdminAuthPage onLoginSuccess={handleAdminLoginSuccess} />} />
      <Route
        path="/admin/dashboard"
        element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/admin" />}
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
