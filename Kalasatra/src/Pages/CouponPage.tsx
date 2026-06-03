import { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

interface Coupon {
  id: string;
  code: string;
  coins: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export default function CouponPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [coins, setCoins] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadCoupons();
  }, []);
  useEffect(() => {
  if (message) {
    const timer = setTimeout(() => {
      setMessage(null);
    }, 2000); // 2 seconds

    return () => clearTimeout(timer);
  }
}, [message]);

  const loadCoupons = async () => {
    setLoading(true);
    const res = await apiRequest('/admin/coupons');
    if (res.success && res.data) {
      setCoupons(res.data);
    }
    setLoading(false);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toLocalDatetimeValue = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!code.trim() || !coins || !startDate || !endDate) {
      setMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      setMessage({ type: 'error', text: 'End date must be after start date.' });
      return;
    }

    setSubmitting(true);
    const res = await apiRequest('/admin/coupons', {
      method: 'POST',
      body: JSON.stringify({
        code: code.trim(),
        coins: parseInt(coins),
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      }),
    });
    setSubmitting(false);

    if (res.success) {
      setMessage({ type: 'success', text: `Coupon "${code.trim().toUpperCase()}" created!` });
      setCode('');
      setCoins('');
      setStartDate('');
      setEndDate('');
      loadCoupons();
    } else {
      setMessage({ type: 'error', text: res.message || 'Failed to create coupon.' });
    }
  };

  const handleDelete = async (id: string, couponCode: string) => {
    if (!confirm(`Delete coupon "${couponCode}"?`)) return;
    const res = await apiRequest(`/admin/coupons/${id}`, { method: 'DELETE' });
    if (res.success) {
      setMessage({ type: 'success', text: `Coupon "${couponCode}" deleted.` });
      loadCoupons();
    } else {
      setMessage({ type: 'error', text: res.message || 'Failed to delete coupon.' });
    }
  };

  return (
    <div className="min-h-screen bg-cold-white">
      <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-soft-white">Coupon Management</h1>
          <p className="text-sm text-[#999] mt-1">Create and manage Kalasatra coin coupons</p>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
              message.type === 'success'
                ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-700/30'
                : 'bg-red-900/30 text-red-400 border border-red-700/30'
            }`}
          >
            {message.text}

          </div>
        )}

        {/* ─── Create Coupon Form ─── */}
        <div className="bg-dark-charcoal rounded-xl border border-[#333] p-4 sm:p-6 mb-8">
          <h2 className="text-base font-semibold text-soft-white mb-5">Create New Coupon</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#999]">Coupon Code *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. KALASATRA50"
                  className="w-full px-3 py-2.5 bg-[#0F0F0F] border border-[#333] rounded-lg text-[#F5F5F5] text-sm placeholder-[#666] outline-none focus:border-[#D4AF37] transition-colors uppercase"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#999]">Kalasatra Coins *</label>
                <input
                  type="number"
                  min="0"
                  value={coins}
                  onChange={(e) => setCoins(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full px-3 py-2.5 bg-[#0F0F0F] border border-[#333] rounded-lg text-[#F5F5F5] text-sm placeholder-[#666] outline-none focus:border-[#D4AF37] transition-colors"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#999]">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0F0F0F] border border-[#333] rounded-lg text-[#F5F5F5] text-sm outline-none focus:border-[#D4AF37] transition-colors [color-scheme:dark]"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#999]">End Date & Time *</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0F0F0F] border border-[#333] rounded-lg text-[#F5F5F5] text-sm outline-none focus:border-[#D4AF37] transition-colors [color-scheme:dark]"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-[#D4AF37] text-[#0F0F0F] text-sm font-semibold rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-none cursor-pointer"
              >
                {submitting ? 'Creating...' : 'Create Coupon'}
              </button>
            </div>
          </form>
        </div>

        {/* ─── Coupons List ─── */}
        <div className="bg-dark-charcoal rounded-xl border border-[#333] overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-[#333]">
            <h2 className="text-base font-semibold text-soft-white">
              All Coupons
              {coupons.length > 0 && <span className="text-[#999] font-normal ml-2">({coupons.length})</span>}
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#999] text-sm">No coupons created yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#333] text-[#999] text-xs uppercase tracking-wider">
                    <th className="text-left px-4 sm:px-6 py-3 font-medium">Coupon Code</th>
                    <th className="text-left px-4 sm:px-6 py-3 font-medium">Coins</th>
                    <th className="text-left px-4 sm:px-6 py-3 font-medium hidden sm:table-cell">Start Date</th>
                    <th className="text-left px-4 sm:px-6 py-3 font-medium hidden sm:table-cell">End Date</th>
                    <th className="text-right px-4 sm:px-6 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {coupons.map((coupon) => {
                    const now = new Date();
                    const start = new Date(coupon.start_date);
                    const end = new Date(coupon.end_date);
                    const isExpired = now > end;
                    const isFuture = now < start;
                    return (
                      <tr key={coupon.id} className="bg-black hover:bg-[#634646] transition-colors">
                        <td className="px-4 sm:px-6 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#D4AF37] text-sm">{coupon.code}</span>
                            {isExpired && (
                              <span className="px-1.5 py-0.5 text-[9px] font-semibold uppercase bg-red-900/30 text-red-400 rounded">Expired</span>
                            )}
                            {isFuture && (
                              <span className="px-1.5 py-0.5 text-[9px] font-semibold uppercase bg-blue-900/30 text-blue-400 rounded">Scheduled</span>
                            )}
                            {!isExpired && !isFuture && (
                              <span className="px-1.5 py-0.5 text-[9px] font-semibold uppercase bg-green-900/30 text-green-400 rounded">Active</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 text-[#F5F5F5] font-semibold">{coupon.coins}</td>
                        <td className="px-4 sm:px-6 py-3.5 text-[#999] text-xs hidden sm:table-cell">{formatDate(coupon.start_date)}</td>
                        <td className="px-4 sm:px-6 py-3.5 text-[#999] text-xs hidden sm:table-cell">{formatDate(coupon.end_date)}</td>
                        <td className="px-4 sm:px-6 py-3.5 text-right">
                          <button
                            onClick={() => handleDelete(coupon.id, coupon.code)}
                            className="px-3 py-1.5 bg-red-900/30 text-red-400 text-xs font-medium rounded-lg hover:bg-red-900/50 transition-all border-none cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
