import { useEffect, useState } from 'react';
import { apiRequest, clearTokens } from '../utils/api';
import ProductsPage from './ProductsPage';

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
      <div className="min-h-screen bg-rich-black flex items-center justify-center">
        <div className="bg-dark-charcoal rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-[#999] text-sm">Loading admin profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rich-black py-8 px-4">
      <div className="max-w-5xl mx-auto bg-dark-charcoal rounded-2xl overflow-hidden">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b border-[#333]">
          <div>
            <h1 className="text-2xl font-bold text-soft-white">🛡️ Admin Dashboard</h1>
            <p className="text-sm text-[#999] mt-1">Welcome to the admin control panel</p>
          </div>
          <div className="flex items-center gap-3">
            <nav className="flex gap-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer border ${
                  activeTab === 'dashboard'
                    ? 'bg-luxury-gold text-rich-black border-luxury-gold'
                    : 'bg-transparent text-[#999] border-[#333] hover:border-luxury-gold hover:text-soft-white'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer border ${
                  activeTab === 'products'
                    ? 'bg-luxury-gold text-rich-black border-luxury-gold'
                    : 'bg-transparent text-[#999] border-[#333] hover:border-luxury-gold hover:text-soft-white'
                }`}
              >
                Products
              </button>
            </nav>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-red-400 border border-red-800/50 rounded-lg hover:bg-red-900/30 transition-all cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && adminUser && (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4 p-4 bg-rich-black rounded-xl">
              <div className="w-14 h-14 rounded-full bg-luxury-gold flex items-center justify-center text-xl font-bold text-rich-black shrink-0">
                {adminUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-soft-white">{adminUser.name}</h2>
                <p className="text-sm text-[#999]">{adminUser.email}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-[#D4AF37] text-[#1A1A1A] rounded">{adminUser.role}</span>
                  {adminUser.groups.map((group) => (
                    <span key={group} className="px-2 py-0.5 text-[10px] bg-[#333] text-[#999] rounded">{group}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'User ID', value: adminUser.sub },
                { label: 'Email', value: adminUser.email },
                { label: 'Role', value: adminUser.role },
                { label: 'Groups', value: adminUser.groups.join(', ') || 'None' },
              ].map((item) => (
                <div key={item.label} className="bg-rich-black rounded-xl px-4 py-3">
                  <div className="text-xs text-[#666] uppercase tracking-wider mb-1">{item.label}</div>
                  <div className="text-sm text-soft-white break-all">{item.value}</div>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-base font-semibold text-soft-white mb-4">Admin Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('products')}
                  className="text-left bg-[#1A1A1A] rounded-xl p-4 hover:border-[#D4AF37] transition-all border border-transparent cursor-pointer"
                >
                  <div className="text-2xl mb-2">🛍️</div>
                  <h4 className="text-sm font-semibold text-[#FFFFFF]">Product Management</h4>
                  <p className="text-xs text-[#999] mt-1">Manage products, categories, and inventory</p>
                </button>
                <div className="bg-[#1A1A1A]  rounded-xl p-4 opacity-60">
                  <div className="text-2xl mb-2">👥</div>
                  <h4 className="text-sm font-semibold text-[#FFFFFF]">User Management</h4>
                  <p className="text-xs text-[#999] mt-1">Manage user accounts and permissions</p>
                </div>
                <div className="bg-[#1A1A1A]  rounded-xl p-4 opacity-60">
                  <div className="text-2xl mb-2">📊</div>
                  <h4 className="text-sm font-semibold text-[#FFFFFF]">Analytics</h4>
                  <p className="text-xs text-[#999] mt-1">View system analytics and reports</p>
                </div>
                <div className="bg-[#1A1A1A] rounded-xl p-4 opacity-60">
                  <div className="text-2xl mb-2">⚙️</div>
                  <h4 className="text-sm font-semibold text-[#FFFFFF]">Settings</h4>
                  <p className="text-xs text-[#999] mt-1">Configure system settings</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-950/30 border border-emerald-800/30 rounded-xl">
              <strong className="text-emerald-400">✅ Admin Authentication Successful!</strong>
              <p className="mt-2 text-sm text-[#999]">
                Your admin account is verified and active. You have <strong className="text-[#FFFFFF]">{adminUser.role}</strong> level access.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="mt-6">
            <ProductsPage isAdminMode={true} />
          </div>
        )}

      </div>
    </div>
  );
}
