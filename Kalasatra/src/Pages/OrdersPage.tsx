import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../utils/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type DeliveryStatus = 'order_confirmed' | 'out_for_delivery' | 'delivered';

// Matches the JSONB items array stored in order_confirmed.items
// useCheckout saves as { product_name } but older records may use { name }
interface OrderItem {
  product_id: string;
  product_name?: string; // primary field saved by useCheckout
  name?: string;         // fallback for legacy records
  slug?: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

// Normalised shape returned by GET /api/v1/admin/orders
// The controller maps raw order_confirmed columns → this interface
interface Order {
  // ── Identity (from order_confirmed.id)
  id: string;

  // ── User (from order_confirmed.user_id / user_name / user_email / user_phone)
  user_uid: string;       // aliased from user_id
  user_name: string;
  user_email: string;
  user_phone?: string;

  // ── Address (constructed by controller from flat columns)
  shipping_address: {
    full_name: string;    // from shipping_full_name
    line1: string;        // from address_line1
    line2?: string;       // from address_line2
    city: string;
    state: string;
    pincode: string;
    country?: string;
  };

  // ── Raw flat columns also present in the spread (used as fallbacks)
  shipping_full_name?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;

  // ── Products
  items: OrderItem[];

  // ── Payment (aliased by controller)
  total_amount: number;     // from payment_amount
  payment_method: string;   // from payment_mode
  payment_status: string;
  payment_time?: string;

  // ── Raw payment columns (also present via spread)
  payment_amount?: number;
  payment_mode?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;

  // ── Status & Timestamps
  delivery_status: DeliveryStatus;
  created_at: string;
  updated_at: string;
}

type DateFilter = 'all' | 'today' | 'last_week' | 'this_month' | 'last_month';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  DeliveryStatus,
  { label: string; color: string; bg: string; border: string; glow: string; icon: string }
> = {
  order_confirmed: {
    label: 'Order Confirmed',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.12)',
    border: 'rgba(59,130,246,0.35)',
    glow: 'rgba(59,130,246,0.25)',
    icon: '✦',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.35)',
    glow: 'rgba(245,158,11,0.25)',
    icon: '◈',
  },
  delivered: {
    label: 'Delivered',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.35)',
    glow: 'rgba(16,185,129,0.25)',
    icon: '◉',
  },
};

const DATE_FILTER_OPTIONS: { id: DateFilter; label: string }[] = [
  { id: 'all', label: 'All Orders' },
  { id: 'today', label: 'Today' },
  { id: 'last_week', label: 'Last 7 Days' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
];

// ─── Date helpers ─────────────────────────────────────────────────────────────

function getDateRange(filter: DateFilter): { from: Date | null; to: Date | null } {
  const now = new Date();
  switch (filter) {
    case 'today': {
      const from = new Date(now); from.setHours(0, 0, 0, 0);
      const to   = new Date(now); to.setHours(23, 59, 59, 999);
      return { from, to };
    }
    case 'last_week': {
      const from = new Date(now); from.setDate(now.getDate() - 6); from.setHours(0, 0, 0, 0);
      return { from, to: now };
    }
    case 'this_month': {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from, to: now };
    }
    case 'last_month': {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { from, to };
    }
    default:
      return { from: null, to: null };
  }
}

function applyDateFilter(orders: Order[], filter: DateFilter): Order[] {
  const { from, to } = getDateRange(filter);
  if (!from) return orders;
  return orders.filter((o) => {
    const d = new Date(o.created_at);
    return d >= from && (!to || d <= to);
  });
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtCurrency(v: number) {
  return '₹' + Math.round(v).toLocaleString('en-IN');
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-8">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/15" />
        <div className="absolute inset-0 rounded-full border-2 border-t-[#D4AF37] border-r-transparent border-b-transparent border-l-transparent animate-spin shadow-[0_0_20px_rgba(212,175,55,0.3)]" />
        <div className="absolute inset-3 rounded-full border-2 border-b-[#FFDF73] border-r-transparent border-t-transparent border-l-transparent animate-spin shadow-[0_0_15px_rgba(255,223,115,0.3)]" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }} />
      </div>
      <p className="text-[#D4AF37] text-xs uppercase tracking-[0.4em] font-cinzel animate-pulse font-bold">
        Retrieving Manifest...
      </p>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: DeliveryStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap"
      style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.border}`, boxShadow: `0 0 12px ${cfg.glow}` }}
    >
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

// ─── Status Dropdown ──────────────────────────────────────────────────────────

function StatusDropdown({
  orderId,
  current,
  onUpdate,
}: {
  orderId: string;
  current: DeliveryStatus;
  onUpdate: (id: string, status: DeliveryStatus) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSelect = async (status: DeliveryStatus) => {
    if (status === current) { setOpen(false); return; }
    setSaving(true);
    await onUpdate(orderId, status);
    setSaving(false);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={saving}
        className="group flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border border-[#D4AF37]/25 bg-[#0a0310]/50 text-[#D4AF37] hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/10 transition-all duration-300 disabled:opacity-50 cursor-pointer"
      >
        {saving ? (
          <span className="w-3 h-3 border border-t-[#D4AF37] border-[#D4AF37]/20 rounded-full animate-spin" />
        ) : (
          <span className="text-[8px]">▾</span>
        )}
        {saving ? 'Updating...' : 'Set Status'}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 w-52 glass-panel rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-[#D4AF37]/20">
            {(Object.keys(STATUS_CONFIG) as DeliveryStatus[]).map((s) => {
              const cfg = STATUS_CONFIG[s];
              const active = s === current;
              return (
                <button
                  key={s}
                  onClick={() => handleSelect(s)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors duration-200 hover:bg-[#D4AF37]/10 cursor-pointer"
                  style={{ borderLeft: active ? `3px solid ${cfg.color}` : '3px solid transparent' }}
                >
                  <span style={{ color: cfg.color }} className="text-sm">{cfg.icon}</span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: active ? cfg.color : '#A08BA6' }}>
                    {cfg.label}
                  </span>
                  {active && <span className="ml-auto text-[8px]" style={{ color: cfg.color }}>●</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Expanded Order Detail ────────────────────────────────────────────────────

function OrderDetail({ order }: { order: Order }) {
  const addr = order.shipping_address;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 pb-6 pt-2">

      {/* Customer Info */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#D4AF37]/8 rounded-bl-full blur-2xl pointer-events-none" />
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-4 font-cinzel">Customer</p>
        <p className="text-[#FDFBF7] font-semibold text-sm mb-1">{order.user_name}</p>
        <p className="text-[#A08BA6] text-xs mb-1 font-mono">{order.user_email}</p>
        {order.user_phone && <p className="text-[#A08BA6] text-xs font-mono">{order.user_phone}</p>}
        <div className="mt-4 pt-4 border-t border-[#D4AF37]/10">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-2 font-cinzel">Payment</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#A08BA6] uppercase tracking-widest">{order.payment_method}</span>
            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${order.payment_status === 'paid' ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30' : 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30'}`}>
              {order.payment_status}
            </span>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#8B5CF6]/8 rounded-bl-full blur-2xl pointer-events-none" />
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-4 font-cinzel">Delivery Address</p>
        <p className="text-[#FDFBF7] font-semibold text-sm mb-1">{addr?.full_name || order.user_name}</p>
        <p className="text-[#A08BA6] text-xs leading-relaxed">
          {addr?.line1}<br />
          {addr?.line2 && <>{addr.line2}<br /></>}
          {addr?.city}, {addr?.state} — {addr?.pincode}<br />
          {addr?.country || 'India'}
        </p>
      </div>

      {/* Items */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#10B981]/8 rounded-bl-full blur-2xl pointer-events-none" />
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-4 font-cinzel">
          Items ({order.items?.length || 0})
        </p>
        <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
          {(order.items || []).map((item, i) => {
            // Support both product_name (new records) and name (legacy records)
            const displayName = item.product_name || item.name || 'Product';
            return (
              <div key={i} className="flex items-center gap-3 group">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={displayName}
                    className="w-12 h-12 object-cover rounded-lg border border-[#D4AF37]/15 shrink-0 group-hover:border-[#D4AF37]/40 transition-colors"
                  />
                ) : (
                  <div className="w-12 h-12 bg-[#1a0b2e] rounded-lg border border-[#D4AF37]/15 flex items-center justify-center shrink-0">
                    <span className="text-[#D4AF37]/30 text-lg font-cinzel font-bold">K</span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[#FDFBF7] text-xs font-medium truncate">{displayName}</p>
                  <p className="text-[#A08BA6] text-[10px] mt-0.5">
                    {item.size && <span>{item.size}</span>}
                    {item.size && item.color && <span className="mx-1 opacity-40">·</span>}
                    {item.color && <span>{item.color}</span>}
                    <span className="mx-1 opacity-40">·</span>
                    <span>×{item.quantity}</span>
                  </p>
                </div>
                <p className="text-[#D4AF37] text-xs font-bold font-mono shrink-0">{fmtCurrency(item.price * item.quantity)}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-[#D4AF37]/10 flex justify-between items-center">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#A08BA6] font-cinzel">Total</span>
          <span className="text-[#D4AF37] font-black text-base font-mono">{fmtCurrency(order.total_amount)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // ── Load orders ─────────────────────────────────────────────────────────────
  const loadOrders = useCallback(async () => {
    setLoading(true);
    const res = await apiRequest('/admin/orders');
    setLoading(false);
    if (res.success && res.data) {
      setOrders(res.data);
    } else {
      showMsg('error', res.message || 'Failed to retrieve orders.');
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  // ── Toast ────────────────────────────────────────────────────────────────────
  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // ── Update status ────────────────────────────────────────────────────────────
  const updateStatus = async (orderId: string, status: DeliveryStatus) => {
    setUpdatingId(orderId);
    const res = await apiRequest(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ delivery_status: status }),
    });
    setUpdatingId(null);
    if (res.success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, delivery_status: status } : o))
      );
      showMsg('success', `Status updated to "${STATUS_CONFIG[status].label}".`);
    } else {
      showMsg('error', res.message || 'Failed to update status.');
    }
  };

  // ── Derived list ─────────────────────────────────────────────────────────────
  const filtered = applyDateFilter(orders, dateFilter)
    .filter((o) => statusFilter === 'all' || o.delivery_status === statusFilter)
    .filter((o) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.user_name?.toLowerCase().includes(q) ||
        o.user_email?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // ── Summary counts ────────────────────────────────────────────────────────────
  const summaryBase = applyDateFilter(orders, dateFilter);
  const counts = {
    total: summaryBase.length,
    confirmed: summaryBase.filter((o) => o.delivery_status === 'order_confirmed').length,
    out: summaryBase.filter((o) => o.delivery_status === 'out_for_delivery').length,
    delivered: summaryBase.filter((o) => o.delivery_status === 'delivered').length,
    revenue: summaryBase.reduce((s, o) => s + (o.total_amount || 0), 0),
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="font-outfit text-[#FDFBF7]">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 relative">
          <div className="relative">
            <div className="absolute -left-4 sm:-left-6 top-1 bottom-1 w-1 sm:w-1.5 bg-gradient-to-b from-[#FFDF73] to-[#997A15] rounded-r-full shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
            <h1 className="text-2xl sm:text-5xl font-black gold-gradient-text font-cinzel tracking-tight drop-shadow-lg">
              Order Manifest
            </h1>
            <p className="text-xs sm:text-sm text-[#A08BA6] mt-2 font-light tracking-wide">
              Track, manage and fulfil every customer order.
            </p>
          </div>
          <button
            onClick={loadOrders}
            className="group relative self-start sm:self-auto px-7 py-3 bg-[#0f0518]/50 backdrop-blur-md overflow-hidden rounded-xl border border-[#D4AF37]/30 shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#FFDF73] opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            <span className="relative z-10 text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37] group-hover:text-[#FFDF73] transition-colors duration-300">
              ↻ Refresh
            </span>
          </button>
        </div>

        {/* ── Toast ── */}
        {message && (
          <div
            className={`mb-8 px-6 py-4 rounded-xl text-[10px] font-bold tracking-widest uppercase flex items-center gap-4 animate-fade-in border shadow-lg ${
              message.type === 'success'
                ? 'bg-[#0f0518]/80 text-[#10B981] border-[#10B981]/30 shadow-[0_0_20px_rgba(16,185,129,0.2)] backdrop-blur-md'
                : 'bg-[#0f0518]/80 text-[#F43F5E] border-[#F43F5E]/30 shadow-[0_0_20px_rgba(244,63,94,0.2)] backdrop-blur-md'
            }`}
          >
            <div className={`w-2.5 h-2.5 shrink-0 rounded-full animate-pulse ${message.type === 'success' ? 'bg-[#10B981] shadow-[0_0_8px_#10B981]' : 'bg-[#F43F5E] shadow-[0_0_8px_#F43F5E]'}`} />
            {message.text}
          </div>
        )}

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          {[
            { label: 'Total Orders', value: counts.total, color: '#D4AF37', icon: '◈' },
            { label: 'Confirmed', value: counts.confirmed, color: '#3B82F6', icon: '✦' },
            { label: 'Out for Delivery', value: counts.out, color: '#F59E0B', icon: '◈' },
            { label: 'Delivered', value: counts.delivered, color: '#10B981', icon: '◉' },
            { label: 'Revenue', value: fmtCurrency(counts.revenue), color: '#FFDF73', icon: '₹', isText: true },
          ].map((card) => (
            <div key={card.label} className="glass-panel rounded-2xl p-5 relative overflow-hidden hover-lift group">
              <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" style={{ backgroundColor: card.color }} />
              <p className="text-[9px] font-cinzel font-black uppercase tracking-[0.25em] mb-3" style={{ color: card.color }}>{card.label}</p>
              <p className="text-2xl font-light text-[#FDFBF7] tracking-tight">{card.value}</p>
              <div className="absolute bottom-4 right-4 text-2xl opacity-20 font-cinzel" style={{ color: card.color }}>{card.icon}</div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="glass-panel rounded-2xl p-5 sm:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#D4AF37]/8 to-transparent rounded-bl-full blur-3xl pointer-events-none" />

          {/* Date Filter */}
          <div className="mb-6">
            <p className="text-[9px] font-cinzel font-black uppercase tracking-[0.3em] text-[#A08BA6] mb-3">Time Period</p>
            <div className="flex flex-wrap gap-2">
              {DATE_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setDateFilter(opt.id)}
                  className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border transition-all duration-300 cursor-pointer ${
                    dateFilter === opt.id
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFDF73] text-[#0f0518] border-[#FFDF73]/50 shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                      : 'bg-transparent border-white/10 text-[#A08BA6] hover:border-[#D4AF37]/40 hover:text-[#D4AF37]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status + Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2 flex-wrap">
              {(['all', ...Object.keys(STATUS_CONFIG)] as Array<DeliveryStatus | 'all'>).map((s) => {
                const cfg = s !== 'all' ? STATUS_CONFIG[s as DeliveryStatus] : null;
                const active = statusFilter === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.12em] border transition-all duration-300 cursor-pointer ${active ? '' : 'bg-[#0a0310]/40 border-white/10 text-[#A08BA6] hover:border-[#D4AF37]/30 hover:text-[#D4AF37]'}`}
                    style={
                      active
                        ? { color: cfg?.color || '#D4AF37', backgroundColor: cfg?.bg || 'rgba(212,175,55,0.12)', border: `1px solid ${cfg?.border || 'rgba(212,175,55,0.35)'}`, boxShadow: `0 0 12px ${cfg?.glow || 'rgba(212,175,55,0.25)'}` }
                        : {}
                    }
                  >
                    {s === 'all' ? 'All Statuses' : STATUS_CONFIG[s as DeliveryStatus].label}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative sm:ml-auto sm:w-72">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A08BA6] text-sm">⌕</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, order ID…"
                className="w-full pl-9 pr-4 py-2.5 bg-[#0a0310]/60 border border-[#D4AF37]/20 rounded-xl text-[#FDFBF7] text-xs placeholder-[#A08BA6]/40 outline-none focus:border-[#D4AF37]/60 focus:shadow-[0_0_15px_rgba(212,175,55,0.15)] transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* ── Orders Table / Cards ── */}
        <div className="glass-panel rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          {/* Table Header */}
          <div className="px-6 sm:px-10 py-5 sm:py-7 border-b border-[#D4AF37]/15 bg-gradient-to-r from-[#0a0310]/80 to-[#1a0b2e]/30 flex justify-between items-center">
            <h2 className="text-sm font-bold text-[#FDFBF7] uppercase tracking-[0.25em] font-cinzel flex items-center gap-3">
              Orders
              {filtered.length > 0 && (
                <span className="text-[#0f0518] font-bold text-[10px] bg-gradient-to-r from-[#D4AF37] to-[#FFDF73] px-3 py-1 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]">
                  {filtered.length}
                </span>
              )}
            </h2>
          </div>

          {/* Content */}
          {loading ? (
            <Spinner />
          ) : filtered.length === 0 ? (
            <div className="text-center py-32 px-4">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#0a0310] border border-[#D4AF37]/25 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                <span className="text-[#D4AF37] text-3xl opacity-60">📦</span>
              </div>
              <p className="text-[#A08BA6] text-sm uppercase tracking-[0.25em] font-cinzel font-bold">
                {orders.length === 0 ? 'No orders have been placed yet.' : 'No orders match this filter.'}
              </p>
            </div>
          ) : (
            <>
              {/* ── Mobile: Cards ── */}
              <div className="md:hidden divide-y divide-[#D4AF37]/8">
                {filtered.map((order) => (
                  <div key={order.id} className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="text-[#FDFBF7] font-bold text-sm">{order.user_name}</p>
                        <p className="text-[#A08BA6] text-[10px] font-mono mt-0.5 truncate max-w-[200px]">{order.user_email}</p>
                        <p className="text-[#D4AF37]/50 text-[9px] font-mono mt-1 uppercase tracking-wider">{order.id.slice(0, 12)}…</p>
                      </div>
                      <p className="text-[#D4AF37] font-black text-base font-mono shrink-0">{fmtCurrency(order.total_amount)}</p>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <StatusBadge status={order.delivery_status} />
                      <p className="text-[#A08BA6] text-[10px] font-mono">{fmtDate(order.created_at)}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusDropdown orderId={order.id} current={order.delivery_status} onUpdate={updateStatus} />
                      <button
                        onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                        className="text-[10px] font-black uppercase tracking-[0.15em] text-[#A08BA6] hover:text-[#D4AF37] transition-colors cursor-pointer px-3 py-2"
                      >
                        {expandedId === order.id ? '▴ Hide Details' : '▾ View Details'}
                      </button>
                    </div>

                    {expandedId === order.id && (
                      <div className="mt-4">
                        <OrderDetail order={order} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* ── Desktop: Table ── */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#D4AF37]/15 bg-[#0a0310]/50">
                      {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map((h) => (
                        <th key={h} className="px-6 py-5 text-[9px] font-cinzel font-black uppercase tracking-[0.3em] text-[#A08BA6]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4AF37]/8">
                    {filtered.map((order) => (
                      <>
                        <tr
                          key={order.id}
                          className={`hover:bg-[#D4AF37]/5 transition-colors duration-200 group ${updatingId === order.id ? 'opacity-50' : ''}`}
                        >
                          {/* Order ID */}
                          <td className="px-6 py-5">
                            <p className="text-[#D4AF37]/70 text-[10px] font-mono tracking-widest uppercase">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </p>
                          </td>

                          {/* Customer */}
                          <td className="px-6 py-5">
                            <p className="text-[#FDFBF7] font-semibold text-sm">{order.user_name}</p>
                            <p className="text-[#A08BA6] text-[10px] font-mono mt-0.5">{order.user_email}</p>
                          </td>

                          {/* Items count */}
                          <td className="px-6 py-5">
                            <span className="text-[#FDFBF7] text-sm">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</span>
                          </td>

                          {/* Total */}
                          <td className="px-6 py-5">
                            <span className="text-[#D4AF37] font-black text-sm font-mono">{fmtCurrency(order.total_amount)}</span>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-5">
                            <StatusBadge status={order.delivery_status} />
                          </td>

                          {/* Date */}
                          <td className="px-6 py-5">
                            <span className="text-[#A08BA6] text-xs font-mono">{fmtDate(order.created_at)}</span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                              <StatusDropdown orderId={order.id} current={order.delivery_status} onUpdate={updateStatus} />
                              <button
                                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                                className="text-[10px] font-black uppercase tracking-[0.12em] text-[#A08BA6] hover:text-[#D4AF37] transition-colors cursor-pointer px-3 py-2 rounded-lg hover:bg-[#D4AF37]/10"
                              >
                                {expandedId === order.id ? '▴' : '▾'} Details
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded detail row */}
                        {expandedId === order.id && (
                          <tr key={`${order.id}-detail`} className="bg-[#0a0310]/40 border-b border-[#D4AF37]/10">
                            <td colSpan={7} className="p-0">
                              <OrderDetail order={order} />
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
