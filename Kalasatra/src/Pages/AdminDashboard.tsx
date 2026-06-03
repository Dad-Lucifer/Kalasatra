import { useEffect, useState } from 'react';
import { apiRequest, clearTokens } from '../utils/api';
import ProductsPage from './ProductsPage';
import CouponPage from './CouponPage';
import logoImg from '../assets/kalastra-logo.png';

interface AdminUser {
  sub: string;
  email: string;
  name: string;
  role: string;
  groups: string[];
}

interface CategoryTotal {
  count: number;
  selling: number;
  buying: number;
}

interface AnalyticsData {
  categoryTotals: Record<string, CategoryTotal>;
  totalRevenue: number;
  totalInvested: number;
  profitMargin: number;
  ratio: number;
  productCount: number;
  monthlyIncome: { label: string; value: number };
  yearlyIncome: { label: string; value: number };
  lastMonthIncome: { label: string; value: number };
  onlineVsCod: { online: number; cod: number };
}

type SidebarTab = 'dashboard' | 'products' | 'coupons';

export default function AdminDashboard() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    loadAdminProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadAnalytics();
    }
  }, [activeTab]);

  const loadAdminProfile = async () => {
    setLoading(true);
    const storedUser = localStorage.getItem('adminUser');
    if (storedUser) {
      setAdminUser(JSON.parse(storedUser));
    }
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

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    const res = await apiRequest('/admin/analytics');
    if (res.success && res.data) {
      setAnalytics(res.data);
    }
    setAnalyticsLoading(false);
  };

  const handleLogout = () => {
    clearTokens();
    localStorage.removeItem('adminUser');
    window.location.reload();
  };

  const handleNavClick = (tab: SidebarTab) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
  };

  const formatCurrency = (value: number) =>
    '₹' + value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const sidebarNav = [
    { id: 'dashboard' as SidebarTab, label: 'Dashboard'},
    { id: 'products' as SidebarTab, label: 'Products' },
    { id: 'coupons' as SidebarTab, label: 'Coupons' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-rich-black flex items-center justify-center">
        <div className="bg-dark-charcoal rounded-2xl p-8 max-w-md w-full text-center mx-4">
          <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-[#999] text-sm">Loading admin profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rich-black">
      {/* ─── Mobile Header ─── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-14 px-4 bg-[#F8FAFC]/30 backdrop-blur  border-b border-[#333]">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 text-soft-white hover:text-[#D4AF37] transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
           <img src={logoImg} alt="Kalastra Logo" className="h-20 w-auto object-contain" />
          <span className="text-sm font-bold text-soft-white">Kalasatra</span>
        </div>
        <div className="w-10" />
      </div>

      {/* ─── Mobile Sidebar Overlay ─── */}
      {mobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar (mobile: off-canvas, desktop: fixed) ─── */}
      <aside
        className={`
          fixed top-0 left-0 h-screen  w-[calc(80%-1rem)] z-50 bg-[#e4e1e1] border-r border-[#333] flex flex-col
          transition-transform duration-400
          lg:transition-all lg:duration-400 lg:z-40
          ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}
          ${
            mobileSidebarOpen
              ? 'translate-x-0'
              : '-translate-x-full lg:translate-x-0'
          }
        `}
      >
        {/* Brand - hidden on mobile (already in mobile header) */}
        <div className="hidden lg:flex items-center gap-3 px-2 h-20 border-b border-[#333] shrink-0">
           <img src={logoImg} alt="Kalastra Logo" className="h-20 w-auto object-contain" />
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-soft-white truncate">Kalasatra</h1>
              <p className="text-[10px] text-[#999] uppercase tracking-wider">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Close button - mobile only */}
        <div className="flex lg:hidden items-center  justify-between px-4 h-14 border-b border-[#333]">
          <div className="flex items-center gap-2">
             
            <span className="text-sm font-bold text-soft-white">Menu</span>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1 text-[#999] hover:text-soft-white transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Toggle - desktop only */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex  absolute -right-3 top-20 w-6 h-6 rounded-full bg-dark-charcoal border border-[#333] text-[#999] items-center justify-center text-xs hover:bg-[#D4AF37] hover:text-rich-black transition-all cursor-pointer"
        >
          {sidebarCollapsed ? '›' : '‹'}
        </button>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1 px-3">
          {sidebarNav.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === item.id
                  ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30'
                  : 'text-[#999] hover:text-soft-white hover:bg-[#1A1A1A] border border-transparent'
              }`}
            >
              
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Admin Profile - desktop only */}
        {adminUser && !sidebarCollapsed && (
          <div className="hidden lg:block px-5 py-3 border-t border-[#333]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-xs font-bold text-rich-black shrink-0">
                {adminUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-soft-white truncate">{adminUser.name}</p>
                <p className="text-[10px] text-[#666] truncate">{adminUser.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="px-3 py-3 border-t border-[#333]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/20 transition-all cursor-pointer"
          >
            <span className="text-lg shrink-0">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main
        className={`
          transition-all duration-300
          ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
          pt-14 lg:pt-0
        `}
      >
        {activeTab === 'dashboard' && (
          <div className="p-4 sm:p-6 lg:p-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-soft-white">Dashboard</h1>
                <p className="text-sm text-[#999] mt-0.5">
                  Welcome back, {adminUser?.name || 'Admin'}
                </p>
              </div>
              <button
                onClick={loadAnalytics}
                className="self-start sm:self-auto px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-[#1A1A1A]/30 text-[#131211] rounded-lg hover:bg-[#D4AF37] hover:text-rich-black transition-all cursor-pointer"
              >
                Refresh
              </button>
            </div>

            {/* Analytics */}
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-32">
                <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : analytics ? (
              <div className="space-y-6 sm:space-y-8">
                {/* Per-Category Revenue */}
                <section>
                  <h2 className="text-xs sm:text-sm font-semibold text-[#999] uppercase tracking-wider mb-3 sm:mb-4">
                    Revenue by Category
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {Object.entries(analytics.categoryTotals).map(([cat, data]) => (
                      <div
                        key={cat}
                        className="bg-dark-charcoal rounded-xl border-[1.7px] border-[#333] p-4 sm:p-5 hover:border-[#d4a404] transition-all"
                      >
                        <p className="text-xs uppercase tracking-wider text-[#999] mb-1">{cat}</p>
                        <p className="text-xl sm:text-2xl font-bold text-[#D4AF37]">
                          {formatCurrency(data.selling)}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[10px] text-[#666]">
                          <span>{data.count} products</span>
                          <span>Cost: {formatCurrency(data.buying)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Key Metrics Grid */}
                <section>
                  <h2 className="text-xs sm:text-sm font-semibold text-[#999] uppercase tracking-wider mb-3 sm:mb-4">
                    Key Metrics
                  </h2>
                  <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <MetricCard
                      label="Total Revenue Generated"
                      value={formatCurrency(analytics.totalRevenue)}
                      sub="Sum of all selling prices"
                      color="emerald"
                    />
                    <MetricCard
                      label="Total Revenue Invested"
                      value={formatCurrency(analytics.totalInvested)}
                      sub="Sum of all buying prices"
                      color="amber"
                    />
                    <MetricCard
                      label="Sell / Buy Price Ratio"
                      value={analytics.ratio.toFixed(2) + 'x'}
                      sub={
                        analytics.ratio >= 1
                          ? `Profit: ${formatCurrency(analytics.profitMargin)}`
                          : 'Operating at loss'
                      }
                      color="blue"
                    />
                    <MetricCard
                      label="Total Products"
                      value={String(analytics.productCount)}
                      sub="Across all categories"
                      color="purple"
                    />
                  </div>
                </section>

                {/* Income Overview */}
                <section>
                  <h2 className="text-xs sm:text-sm font-semibold text-[#999] uppercase tracking-wider mb-3 sm:mb-4">
                    Income Overview
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <IncomeCard
                      label="Monthly Income"
                      value={formatCurrency(analytics.monthlyIncome.value)}
                      period={analytics.monthlyIncome.label}
                      color="from-cyan-600/20 to-transparent"
                    />
                    <IncomeCard
                      label="Yearly Income"
                      value={formatCurrency(analytics.yearlyIncome.value)}
                      period={analytics.yearlyIncome.label}
                      color="from-violet-600/20 to-transparent"
                    />
                    <IncomeCard
                      label="Last Month Income"
                      value={formatCurrency(analytics.lastMonthIncome.value)}
                      period={analytics.lastMonthIncome.label}
                      color="from-rose-600/20 to-transparent"
                    />
                  </div>
                  <p className="text-xs text-[#555] mt-2 italic">
                    * Income data requires an active order system. Currently showing product-based margins.
                  </p>
                </section>

                {/* Online vs COD */}
                <section>
                  <h2 className="text-xs sm:text-sm font-semibold text-[#999] uppercase tracking-wider mb-3 sm:mb-4">
                    Order Method Comparison
                  </h2>
                  <div className="bg-dark-charcoal rounded-xl border border-[#333] p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 sm:gap-8">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-[#999]">Online Payments</span>
                          <span className="text-sm font-semibold text-emerald-400">
                            {formatCurrency(analytics.onlineVsCod.online)}
                          </span>
                        </div>
                        <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{
                              width:
                                analytics.onlineVsCod.online + analytics.onlineVsCod.cod > 0
                                  ? `${(analytics.onlineVsCod.online / (analytics.onlineVsCod.online + analytics.onlineVsCod.cod)) * 100}%`
                                  : '0%',
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-[#999]">Cash on Delivery</span>
                          <span className="text-sm font-semibold text-amber-400">
                            {formatCurrency(analytics.onlineVsCod.cod)}
                          </span>
                        </div>
                        <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-500"
                            style={{
                              width:
                                analytics.onlineVsCod.online + analytics.onlineVsCod.cod > 0
                                  ? `${(analytics.onlineVsCod.cod / (analytics.onlineVsCod.online + analytics.onlineVsCod.cod)) * 100}%`
                                  : '0%',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-[#555] mt-3 italic">
                      * Comparison data requires an active order system with payment tracking.
                    </p>
                  </div>
                </section>
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-[#999]">Failed to load analytics.</p>
                <button
                  onClick={loadAnalytics}
                  className="mt-4 px-6 py-2 bg-[#D4AF37] text-rich-black text-sm font-semibold rounded-lg hover:bg-[#C9A227] transition-all cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="p-4 sm:p-6 lg:p-10">
            <ProductsPage isAdminMode={true} />
          </div>
        )}

        {activeTab === 'coupons' && (
          <CouponPage />
        )}
      </main>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: 'emerald' | 'amber' | 'blue' | 'purple';
}) {
  const accentMap = {
    emerald: {
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      hover: 'hover:border-emerald-400',
    },
    amber: {
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      hover: 'hover:border-amber-400',
    },
    blue: {
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      hover: 'hover:border-blue-400',
    },
    purple: {
      text: 'text-purple-400',
      border: 'border-purple-500/30',
      hover: 'hover:border-purple-400',
    },
  };

  const styles = accentMap[color];

  return (
    <div
      className={`bg-dark-charcoal rounded-xl border-[1.6px] border-[#333] p-4 sm:p-5 transition-all duration-300 ${styles.hover}`}
    >
      <p className="text-xs uppercase tracking-wider text-[#999] mb-3">
        {label}
      </p>

      <p className={`text-xl sm:text-2xl font-bold ${styles.text}`}>
        {value}
      </p>

      <div className={`mt-3 w-8 h-0.5 rounded-full ${styles.border}`} />

      <p className="text-[10px] text-[#666] mt-2">
        {sub}
      </p>
    </div>
  );
}

function IncomeCard({
  label,
  value,
  period,
  color,
}: {
  label: string;
  value: string;
  period: string;
  color: string;
}) {
  return (
    <div
      className={`bg-dark-charcoal rounded-xl border-[1.5px]  border-[#333] p-4 sm:p-5 hover:border-[#D4AF37]/30 transition-all bg-linear-to-br ${color}`}
    >
      <p className="text-xs uppercase tracking-wider text-[#999] mb-1">{label}</p>
      <p className="text-base sm:text-lg font-bold text-[#D4AF37]">{value}</p>
      <p className="text-[10px] text-[#666] mt-1">{period}</p>
    </div>
  );
}
