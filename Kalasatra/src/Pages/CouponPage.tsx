import { useState, useEffect, useCallback, useRef } from 'react';
import { apiRequest } from '../utils/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type CouponType = 'coins' | 'discount';
type DiscountType = 'percentage' | 'flat';

interface Coupon {
  id: string;
  code: string;
  name: string | null;
  type: CouponType;
  description: string | null;
  coins: number;
  discount_type: DiscountType | null;
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface FormState {
  code: string;
  name: string;
  type: CouponType;
  description: string;
  coins: string;
  discount_type: DiscountType;
  discount_value: string;
  min_order_amount: string;
  max_discount_amount: string;
  usage_limit: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

const EMPTY_FORM: FormState = {
  code: '',
  name: '',
  type: 'coins',
  description: '',
  coins: '',
  discount_type: 'percentage',
  discount_value: '',
  min_order_amount: '0',
  max_discount_amount: '',
  usage_limit: '',
  start_date: '',
  end_date: '',
  is_active: true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toLocalDatetimeValue(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDisplayDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function getCouponStatus(coupon: Coupon): { label: string; color: string; bg: string; border: string } {
  const now = new Date();
  if (!coupon.is_active) return { label: 'Disabled', color: '#A08BA6', bg: 'rgba(160,139,166,0.1)', border: 'rgba(160,139,166,0.3)' };
  if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit)
    return { label: 'Exhausted', color: '#F43F5E', bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.3)' };
  if (now < new Date(coupon.start_date)) return { label: 'Scheduled', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)' };
  if (now > new Date(coupon.end_date)) return { label: 'Expired', color: '#F43F5E', bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.3)' };
  return { label: 'Active', color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' };
}

// ─── Toast Component ──────────────────────────────────────────────────────────

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-3 px-5 py-4 rounded-2xl border backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-fade-in"
          style={{
            background: 'rgba(10,3,16,0.95)',
            borderColor: t.type === 'success' ? 'rgba(16,185,129,0.4)' : t.type === 'error' ? 'rgba(244,63,94,0.4)' : 'rgba(212,175,55,0.4)',
          }}
        >
          <div
            className="w-2 h-2 rounded-full mt-1 shrink-0 animate-pulse"
            style={{
              backgroundColor: t.type === 'success' ? '#10B981' : t.type === 'error' ? '#F43F5E' : '#D4AF37',
              boxShadow: `0 0 8px ${t.type === 'success' ? '#10B981' : t.type === 'error' ? '#F43F5E' : '#D4AF37'}`,
            }}
          />
          <p className="text-xs font-medium text-[#FDFBF7] leading-relaxed flex-1">{t.message}</p>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-[#A08BA6] hover:text-[#FDFBF7] transition-colors shrink-0 cursor-pointer bg-transparent border-none text-base leading-none mt-0.5"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
  danger = true,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  return (
    <>
      {/* Backdrop — fixed independently so it always covers full screen */}
      <div className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      {/* Content wrapper — flex centering on top of backdrop */}
      <div className="fixed inset-0 z-[151] flex items-center justify-center px-4 pointer-events-none">
      <div className="relative glass-panel rounded-2xl p-8 max-w-sm w-full border border-[#D4AF37]/20 shadow-[0_0_40px_rgba(0,0,0,0.7)] pointer-events-auto">
        <p className="text-sm text-[#FDFBF7] leading-relaxed mb-8">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-[#D4AF37]/30 text-[#A08BA6] text-xs font-bold uppercase tracking-widest hover:text-[#FDFBF7] hover:border-[#D4AF37]/60 transition-all cursor-pointer bg-transparent"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border"
            style={
              danger
                ? { background: 'rgba(244,63,94,0.15)', color: '#F43F5E', borderColor: 'rgba(244,63,94,0.4)' }
                : { background: 'rgba(212,175,55,0.15)', color: '#D4AF37', borderColor: 'rgba(212,175,55,0.4)' }
            }
          >
            Confirm
          </button>
        </div>
      </div>
      </div>
    </>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────

function CouponFormModal({
  initialData,
  editingId,
  onClose,
  onSaved,
}: {
  initialData: FormState;
  editingId: string | null;
  onClose: () => void;
  onSaved: (coupon: Coupon) => void;
}) {
  const [form, setForm] = useState<FormState>(initialData);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const isEditing = !!editingId;

  const set = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.code.trim()) e.code = 'Code is required.';
    if (!form.start_date) e.start_date = 'Start date required.';
    if (!form.end_date) e.end_date = 'End date required.';
    if (form.start_date && form.end_date && new Date(form.end_date) <= new Date(form.start_date)) {
      e.end_date = 'End must be after start.';
    }
    if (form.type === 'coins') {
      if (!form.coins || parseInt(form.coins) < 1) e.coins = 'Must be ≥ 1.';
    }
    if (form.type === 'discount') {
      const dv = parseFloat(form.discount_value);
      if (!form.discount_value || isNaN(dv) || dv <= 0) e.discount_value = 'Must be > 0.';
      if (form.discount_type === 'percentage' && dv > 100) e.discount_value = 'Cannot exceed 100%.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const payload: Record<string, unknown> = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim() || null,
      description: form.description.trim() || null,
      start_date: new Date(form.start_date).toISOString(),
      end_date: new Date(form.end_date).toISOString(),
      is_active: form.is_active,
      usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
      min_order_amount: parseFloat(form.min_order_amount) || 0,
      max_discount_amount: form.max_discount_amount ? parseFloat(form.max_discount_amount) : null,
    };

    if (!isEditing) {
      payload.type = form.type;
    }

    if (form.type === 'coins') {
      payload.coins = parseInt(form.coins);
    } else {
      payload.discount_type = form.discount_type;
      payload.discount_value = parseFloat(form.discount_value);
    }

    const endpoint = isEditing ? `/admin/coupons/${editingId}` : '/admin/coupons';
    const method = isEditing ? 'PATCH' : 'POST';
    const res = await apiRequest<Coupon>(endpoint, { method, body: JSON.stringify(payload) });

    setSubmitting(false);

    if (res.success && res.data) {
      onSaved(res.data);
    } else {
      setErrors({ code: res.message || 'Failed to save coupon.' });
    }
  };

  const inputClass = (field: keyof FormState) =>
    `w-full px-4 py-3 bg-[#0a0310]/60 border rounded-xl text-[#FDFBF7] text-xs placeholder-[#A08BA6]/50 outline-none transition-all font-mono shadow-inner ${
      errors[field]
        ? 'border-[#F43F5E]/60 focus:border-[#F43F5E] focus:shadow-[0_0_15px_rgba(244,63,94,0.2)]'
        : 'border-[#D4AF37]/20 focus:border-[#D4AF37]/80 focus:shadow-[0_0_15px_rgba(212,175,55,0.2)]'
    }`;

  const labelClass = 'block text-[9px] font-black uppercase tracking-[0.2em] text-[#A08BA6] mb-2';

  return (
    <>
      {/* Backdrop — fixed independently so scrolling the form never reveals the page behind */}
      <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm" onClick={onClose} />
      {/* Scroll wrapper — sits above the backdrop, lets tall forms scroll */}
      <div className="fixed inset-0 z-[101] overflow-y-auto">
        <div className="flex min-h-full items-start justify-center py-8 px-4">
      <div className="relative w-full max-w-2xl glass-panel rounded-[2rem] overflow-hidden border border-[#D4AF37]/20 shadow-[0_0_60px_rgba(0,0,0,0.8)] my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#D4AF37]/15 bg-gradient-to-r from-[#0a0310]/80 to-[#1a0b2e]/30">
          <h2 className="text-base font-bold text-[#FDFBF7] uppercase tracking-[0.2em] font-cinzel">
            {isEditing ? 'Edit Coupon' : 'Create Coupon'}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#0a0310] border border-[#D4AF37]/20 text-[#A08BA6] hover:text-[#FDFBF7] hover:border-[#D4AF37]/60 transition-all cursor-pointer flex items-center justify-center text-lg"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Type selector — only on create */}
          {!isEditing && (
            <div>
              <p className={labelClass}>Coupon Type *</p>
              <div className="grid grid-cols-2 gap-3">
                {(['coins', 'discount'] as CouponType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set('type', t)}
                    className="relative py-4 px-5 rounded-xl border transition-all cursor-pointer overflow-hidden"
                    style={
                      form.type === t
                        ? { background: 'rgba(212,175,55,0.15)', borderColor: 'rgba(212,175,55,0.6)', color: '#D4AF37' }
                        : { background: 'rgba(10,3,16,0.6)', borderColor: 'rgba(212,175,55,0.15)', color: '#A08BA6' }
                    }
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest font-cinzel block">
                      {t === 'coins' ? '🪙 Kalastra Coins' : '🏷️ Discount Coupon'}
                    </span>
                    <span className="text-[9px] mt-1 block opacity-70">
                      {t === 'coins' ? 'Credits wallet on redeem' : 'Applied at checkout'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Code + Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Coupon Code *</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => set('code', e.target.value.toUpperCase())}
                placeholder="e.g. SAVE20"
                className={`${inputClass('code')} uppercase tracking-widest`}
                readOnly={isEditing}
                style={isEditing ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
              />
              {errors.code && <p className="mt-1.5 text-[9px] text-[#F43F5E] font-bold">{errors.code}</p>}
            </div>
            <div>
              <label className={labelClass}>Coupon Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Summer Sale 20%"
                className={inputClass('name')}
              />
            </div>
          </div>

          {/* Type-specific value fields */}
          {form.type === 'coins' ? (
            <div>
              <label className={labelClass}>Coins to Award *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37] font-bold text-sm">¢</span>
                <input
                  type="number"
                  min="1"
                  value={form.coins}
                  onChange={(e) => set('coins', e.target.value)}
                  placeholder="100"
                  className={`${inputClass('coins')} pl-9`}
                />
              </div>
              {errors.coins && <p className="mt-1.5 text-[9px] text-[#F43F5E] font-bold">{errors.coins}</p>}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Discount type */}
                <div>
                  <label className={labelClass}>Discount Type *</label>
                  <div className="flex gap-2">
                    {(['percentage', 'flat'] as DiscountType[]).map((dt) => (
                      <button
                        key={dt}
                        type="button"
                        onClick={() => set('discount_type', dt)}
                        className="flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                        style={
                          form.discount_type === dt
                            ? { background: 'rgba(212,175,55,0.15)', borderColor: 'rgba(212,175,55,0.6)', color: '#D4AF37' }
                            : { background: 'rgba(10,3,16,0.6)', borderColor: 'rgba(212,175,55,0.15)', color: '#A08BA6' }
                        }
                      >
                        {dt === 'percentage' ? '% Off' : '₹ Flat'}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Discount value */}
                <div>
                  <label className={labelClass}>
                    {form.discount_type === 'percentage' ? 'Discount % *' : 'Flat Discount (₹) *'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37] font-bold text-sm">
                      {form.discount_type === 'percentage' ? '%' : '₹'}
                    </span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      max={form.discount_type === 'percentage' ? '100' : undefined}
                      value={form.discount_value}
                      onChange={(e) => set('discount_value', e.target.value)}
                      placeholder={form.discount_type === 'percentage' ? '20' : '100'}
                      className={`${inputClass('discount_value')} pl-9`}
                    />
                  </div>
                  {errors.discount_value && <p className="mt-1.5 text-[9px] text-[#F43F5E] font-bold">{errors.discount_value}</p>}
                </div>
              </div>
              {/* Min order + max discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Min Order Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A08BA6] text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.min_order_amount}
                      onChange={(e) => set('min_order_amount', e.target.value)}
                      placeholder="0"
                      className={`${inputClass('min_order_amount')} pl-9`}
                    />
                  </div>
                </div>
                {form.discount_type === 'percentage' && (
                  <div>
                    <label className={labelClass}>Max Discount Cap (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A08BA6] text-sm">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.max_discount_amount}
                        onChange={(e) => set('max_discount_amount', e.target.value)}
                        placeholder="Uncapped"
                        className={`${inputClass('max_discount_amount')} pl-9`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Start Date & Time *</label>
              <input
                type="datetime-local"
                value={form.start_date}
                onChange={(e) => set('start_date', e.target.value)}
                className={`${inputClass('start_date')} [color-scheme:dark]`}
              />
              {errors.start_date && <p className="mt-1.5 text-[9px] text-[#F43F5E] font-bold">{errors.start_date}</p>}
            </div>
            <div>
              <label className={labelClass}>End Date & Time *</label>
              <input
                type="datetime-local"
                value={form.end_date}
                onChange={(e) => set('end_date', e.target.value)}
                className={`${inputClass('end_date')} [color-scheme:dark]`}
              />
              {errors.end_date && <p className="mt-1.5 text-[9px] text-[#F43F5E] font-bold">{errors.end_date}</p>}
            </div>
          </div>

          {/* Usage limit + description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Global Usage Limit</label>
              <input
                type="number"
                min="1"
                value={form.usage_limit}
                onChange={(e) => set('usage_limit', e.target.value)}
                placeholder="Unlimited"
                className={inputClass('usage_limit')}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => set('is_active', !form.is_active)}
                  className="relative w-12 h-6 rounded-full transition-all cursor-pointer border"
                  style={
                    form.is_active
                      ? { background: 'rgba(16,185,129,0.3)', borderColor: 'rgba(16,185,129,0.5)' }
                      : { background: 'rgba(160,139,166,0.15)', borderColor: 'rgba(160,139,166,0.3)' }
                  }
                >
                  <div
                    className="absolute top-0.5 w-5 h-5 rounded-full transition-all shadow-md"
                    style={{
                      left: form.is_active ? 'calc(100% - 22px)' : '2px',
                      background: form.is_active ? '#10B981' : '#A08BA6',
                      boxShadow: form.is_active ? '0 0 8px rgba(16,185,129,0.6)' : 'none',
                    }}
                  />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#A08BA6]">
                  {form.is_active ? 'Active' : 'Inactive'}
                </span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description (optional)</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={2}
              placeholder="Internal note or user-facing description..."
              className={`${inputClass('description')} resize-none`}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#D4AF37]/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-[#D4AF37]/20 text-[#A08BA6] text-[10px] font-black uppercase tracking-widest hover:text-[#FDFBF7] hover:border-[#D4AF37]/50 transition-all cursor-pointer bg-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="group relative px-8 py-3 bg-[#0a0310] overflow-hidden rounded-xl border border-[#D4AF37]/40 shadow-[0_0_20px_rgba(212,175,55,0.15)] disabled:opacity-50 disabled:cursor-not-allowed hover-lift cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#FFDF73] opacity-10 group-hover:opacity-25 transition-opacity duration-300" />
              <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] group-hover:text-[#FFDF73] transition-colors duration-300">
                {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Coupon'}
              </span>
            </button>
          </div>
        </form>
      </div>
        </div>
      </div>
    </>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          <div className="h-10 bg-[#D4AF37]/5 rounded-xl flex-1" style={{ animationDelay: `${i * 0.1}s` }} />
          <div className="h-10 bg-[#D4AF37]/5 rounded-xl w-24" style={{ animationDelay: `${i * 0.1 + 0.05}s` }} />
          <div className="h-10 bg-[#D4AF37]/5 rounded-xl w-24" style={{ animationDelay: `${i * 0.1 + 0.1}s` }} />
        </div>
      ))}
    </div>
  );
}

// ─── Main CouponPage ──────────────────────────────────────────────────────────

export default function CouponPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<CouponType>('coins');
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<'' | 'true' | 'false'>('');
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const toastIdRef = useRef(0);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ type: activeTab });
    if (filterActive !== '') params.set('is_active', filterActive);
    if (search.trim()) params.set('search', search.trim());

    const res = await apiRequest<Coupon[]>(`/admin/coupons?${params.toString()}`);
    if (res.success && res.data) {
      setCoupons(res.data);
    } else if (!res.success) {
      addToast('error', res.message || 'Failed to load coupons.');
    }
    setLoading(false);
  }, [activeTab, filterActive, search, addToast]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleSaved = (coupon: Coupon) => {
    setShowModal(false);
    setEditingCoupon(null);
    addToast('success', `Coupon "${coupon.code}" ${editingCoupon ? 'updated' : 'created'} successfully.`);
    loadCoupons();
  };

  const handleToggle = async (coupon: Coupon) => {
    setTogglingId(coupon.id);
    const res = await apiRequest<Coupon>(`/admin/coupons/${coupon.id}/toggle`, { method: 'PATCH' });
    setTogglingId(null);
    if (res.success && res.data) {
      addToast('success', `"${coupon.code}" ${res.data.is_active ? 'enabled' : 'disabled'}.`);
      setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? { ...c, is_active: res.data!.is_active } : c)));
    } else {
      addToast('error', res.message || 'Failed to toggle coupon.');
    }
  };

  const handleDelete = (coupon: Coupon) => {
    setConfirm({
      message: `Permanently delete coupon "${coupon.code}"? This cannot be undone and will remove all redemption records.`,
      onConfirm: async () => {
        setConfirm(null);
        setDeletingId(coupon.id);
        const res = await apiRequest(`/admin/coupons/${coupon.id}`, { method: 'DELETE' });
        setDeletingId(null);
        if (res.success) {
          addToast('success', `Coupon "${coupon.code}" deleted.`);
          setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
        } else {
          addToast('error', res.message || 'Failed to delete coupon.');
        }
      },
    });
  };

  const openCreate = () => {
    setEditingCoupon(null);
    setShowModal(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setShowModal(true);
  };

  // Build initial form data for editing
  const getInitialForm = (): FormState => {
    if (!editingCoupon) return { ...EMPTY_FORM, type: activeTab };
    return {
      code: editingCoupon.code,
      name: editingCoupon.name || '',
      type: editingCoupon.type,
      description: editingCoupon.description || '',
      coins: String(editingCoupon.coins || ''),
      discount_type: editingCoupon.discount_type || 'percentage',
      discount_value: editingCoupon.discount_value ? String(editingCoupon.discount_value) : '',
      min_order_amount: String(editingCoupon.min_order_amount || '0'),
      max_discount_amount: editingCoupon.max_discount_amount ? String(editingCoupon.max_discount_amount) : '',
      usage_limit: editingCoupon.usage_limit ? String(editingCoupon.usage_limit) : '',
      start_date: toLocalDatetimeValue(editingCoupon.start_date),
      end_date: toLocalDatetimeValue(editingCoupon.end_date),
      is_active: editingCoupon.is_active,
    };
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const activeCoupons = coupons.filter((c) => getCouponStatus(c).label === 'Active').length;
  const totalUsage = coupons.reduce((sum, c) => sum + (c.usage_count || 0), 0);

  return (
    <div className="font-outfit text-[#FDFBF7]">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
          danger
        />
      )}
      {showModal && (
        <CouponFormModal
          initialData={getInitialForm()}
          editingId={editingCoupon?.id || null}
          onClose={() => { setShowModal(false); setEditingCoupon(null); }}
          onSaved={handleSaved}
        />
      )}

      <div className="max-w-7xl mx-auto">
        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 relative">
          <div className="relative">
            <div className="absolute -left-4 sm:-left-6 top-1 bottom-1 w-1 sm:w-1.5 bg-gradient-to-b from-[#FFDF73] to-[#997A15] rounded-r-full shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black gold-gradient-text font-cinzel tracking-tight drop-shadow-lg">
              Coupon Sanctum
            </h1>
            <p className="text-xs sm:text-sm text-[#A08BA6] mt-2 font-light tracking-wide">
              Forge, manage, and monitor your coupon decrees.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="group relative px-6 sm:px-8 py-3.5 bg-[#0a0310] overflow-hidden rounded-xl border border-[#D4AF37]/40 shadow-[0_0_20px_rgba(212,175,55,0.2)] hover-lift cursor-pointer self-start sm:self-auto shrink-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#FFDF73] opacity-10 group-hover:opacity-25 transition-opacity duration-300" />
            <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] group-hover:text-[#FFDF73] transition-colors duration-300">
              + Forge Coupon
            </span>
          </button>
        </div>

        {/* ── Stats Row ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: coupons.length, color: '#D4AF37' },
            { label: 'Active Now', value: activeCoupons, color: '#10B981' },
            { label: 'Redemptions', value: totalUsage, color: '#3B82F6' },
            { label: 'Inactive', value: coupons.length - activeCoupons, color: '#A08BA6' },
          ].map((stat) => (
            <div key={stat.label} className="glass-panel rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 rounded-full" style={{ background: `linear-gradient(to right, ${stat.color}60, transparent)` }} />
              <p className="text-[9px] uppercase tracking-[0.25em] font-bold mb-2" style={{ color: stat.color }}>{stat.label}</p>
              <p className="text-3xl font-light text-[#FDFBF7]">{loading ? '—' : stat.value}</p>
            </div>
          ))}
        </div>

        {/* ── Tab + Toolbar ─────────────────────────────────────────────────── */}
        <div className="glass-panel rounded-[2rem] overflow-hidden relative shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          {/* Toolbar */}
          <div className="px-5 sm:px-8 py-5 border-b border-[#D4AF37]/15 bg-gradient-to-r from-[#0a0310]/80 to-[#1a0b2e]/30 flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Tabs */}
            <div className="flex gap-2 shrink-0">
              {([
                { key: 'coins', label: '🪙 Coins Coupons' },
                { key: 'discount', label: '🏷️ Discount Coupons' },
              ] as { key: CouponType; label: string }[]).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest font-cinzel transition-all cursor-pointer border"
                  style={
                    activeTab === key
                      ? { background: 'rgba(212,175,55,0.2)', borderColor: 'rgba(212,175,55,0.5)', color: '#D4AF37' }
                      : { background: 'transparent', borderColor: 'rgba(212,175,55,0.1)', color: '#A08BA6' }
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Search + filter */}
            <div className="flex gap-3 flex-1 sm:justify-end">
              <div className="relative flex-1 sm:max-w-xs">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A08BA6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search code..."
                  className="w-full pl-8 pr-4 py-2.5 bg-[#0a0310]/60 border border-[#D4AF37]/20 rounded-xl text-[#FDFBF7] text-xs placeholder-[#A08BA6]/50 outline-none focus:border-[#D4AF37]/60 transition-all"
                />
              </div>
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value as '' | 'true' | 'false')}
                className="px-3 py-2.5 bg-[#0a0310]/60 border border-[#D4AF37]/20 rounded-xl text-[#A08BA6] text-xs outline-none focus:border-[#D4AF37]/60 transition-all cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          {/* ── Table / Card list ─────────────────────────────────────────── */}
          {loading ? (
            <TableSkeleton />
          ) : coupons.length === 0 ? (
            <div className="text-center py-24 px-4">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#0a0310] border border-[#D4AF37]/25 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                <span className="text-3xl">{activeTab === 'coins' ? '🪙' : '🏷️'}</span>
              </div>
              <p className="text-[#A08BA6] text-xs uppercase tracking-[0.25em] font-cinzel font-bold">No coupons found.</p>
              <button
                onClick={openCreate}
                className="mt-6 px-6 py-3 rounded-xl border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-black uppercase tracking-widest hover:bg-[#D4AF37]/10 transition-all cursor-pointer bg-transparent"
              >
                Forge First Decree
              </button>
            </div>
          ) : (
            <>
              {/* ── Mobile card layout ─────────────────────────────────────── */}
              <div className="lg:hidden divide-y divide-[#D4AF37]/10">
                {coupons.map((coupon) => {
                  const status = getCouponStatus(coupon);
                  const isDeleting = deletingId === coupon.id;
                  const isToggling = togglingId === coupon.id;
                  return (
                    <div key={coupon.id} className="p-5 flex flex-col gap-4 hover:bg-[#D4AF37]/5 transition-colors" style={{ opacity: isDeleting ? 0.4 : 1 }}>
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-black text-[#FDFBF7] text-sm tracking-widest">{coupon.code}</span>
                            <span
                              className="px-2 py-0.5 text-[8px] font-black tracking-widest uppercase rounded border"
                              style={{ color: status.color, background: status.bg, borderColor: status.border }}
                            >
                              {status.label}
                            </span>
                          </div>
                          {coupon.name && <p className="text-[10px] text-[#A08BA6] mt-1 truncate">{coupon.name}</p>}
                        </div>
                        {/* Value badge */}
                        <div className="flex items-center gap-1.5 bg-[#0a0310] px-3 py-1.5 rounded-lg border border-[#D4AF37]/20 shrink-0">
                          {coupon.type === 'coins' ? (
                            <>
                              <span className="text-[#D4AF37] text-xs font-black">¢</span>
                              <span className="text-[#D4AF37] font-black text-sm font-mono">{coupon.coins}</span>
                            </>
                          ) : (
                            <span className="text-[#D4AF37] font-black text-sm font-mono">
                              {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 bg-[#0a0310]/40 p-3 rounded-xl border border-white/5 text-[10px]">
                        <div>
                          <span className="text-[#A08BA6] uppercase tracking-widest block mb-0.5">Start</span>
                          <span className="text-[#FDFBF7] font-mono">{formatDisplayDate(coupon.start_date)}</span>
                        </div>
                        <div>
                          <span className="text-[#A08BA6] uppercase tracking-widest block mb-0.5">End</span>
                          <span className="text-[#FDFBF7] font-mono">{formatDisplayDate(coupon.end_date)}</span>
                        </div>
                        <div>
                          <span className="text-[#A08BA6] uppercase tracking-widest block mb-0.5">Usage</span>
                          <span className="text-[#FDFBF7] font-mono">
                            {coupon.usage_count} / {coupon.usage_limit ?? '∞'}
                          </span>
                        </div>
                        {coupon.type === 'discount' && coupon.min_order_amount > 0 && (
                          <div>
                            <span className="text-[#A08BA6] uppercase tracking-widest block mb-0.5">Min Order</span>
                            <span className="text-[#FDFBF7] font-mono">₹{coupon.min_order_amount}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(coupon)}
                          className="flex-1 py-2 rounded-lg border border-[#D4AF37]/25 text-[#D4AF37] text-[9px] font-black uppercase tracking-widest hover:bg-[#D4AF37]/10 transition-all cursor-pointer bg-transparent"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggle(coupon)}
                          disabled={isToggling}
                          className="flex-1 py-2 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer bg-transparent disabled:opacity-50"
                          style={
                            coupon.is_active
                              ? { borderColor: 'rgba(160,139,166,0.3)', color: '#A08BA6' }
                              : { borderColor: 'rgba(16,185,129,0.3)', color: '#10B981' }
                          }
                        >
                          {isToggling ? '...' : coupon.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleDelete(coupon)}
                          disabled={isDeleting}
                          className="flex-1 py-2 rounded-lg border border-[#F43F5E]/25 text-[#F43F5E] text-[9px] font-black uppercase tracking-widest hover:bg-[#F43F5E]/10 transition-all cursor-pointer bg-transparent disabled:opacity-50"
                        >
                          {isDeleting ? '...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Desktop table ─────────────────────────────────────────── */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#D4AF37]/15 bg-[#0a0310]/50">
                      <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.25em] text-[#A08BA6]">Code / Name</th>
                      <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.25em] text-[#A08BA6]">Value</th>
                      {activeTab === 'discount' && (
                        <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.25em] text-[#A08BA6]">Min Order</th>
                      )}
                      <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.25em] text-[#A08BA6]">Validity</th>
                      <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.25em] text-[#A08BA6]">Usage</th>
                      <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.25em] text-[#A08BA6]">Status</th>
                      <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.25em] text-[#A08BA6] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4AF37]/8">
                    {coupons.map((coupon) => {
                      const status = getCouponStatus(coupon);
                      const isDeleting = deletingId === coupon.id;
                      const isToggling = togglingId === coupon.id;
                      const usagePct = coupon.usage_limit ? Math.min((coupon.usage_count / coupon.usage_limit) * 100, 100) : 0;

                      return (
                        <tr
                          key={coupon.id}
                          className="hover:bg-[#D4AF37]/5 transition-colors duration-200 group"
                          style={{ opacity: isDeleting ? 0.4 : 1 }}
                        >
                          {/* Code */}
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-1">
                              <span className="font-mono font-black text-[#FDFBF7] text-sm tracking-widest">{coupon.code}</span>
                              {coupon.name && <span className="text-[10px] text-[#A08BA6]">{coupon.name}</span>}
                            </div>
                          </td>

                          {/* Value */}
                          <td className="px-6 py-5">
                            {coupon.type === 'coins' ? (
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FFDF73] to-[#B8922A] flex items-center justify-center border border-[#FFDF73]/40 shadow-[0_0_8px_rgba(212,175,55,0.4)]">
                                  <span className="text-[#0a0310] text-[8px] font-black">¢</span>
                                </div>
                                <span className="text-[#D4AF37] font-black text-lg font-mono">{coupon.coins}</span>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[#D4AF37] font-black text-lg font-mono">
                                  {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                                </span>
                                {coupon.max_discount_amount && (
                                  <span className="text-[9px] text-[#A08BA6]">max ₹{coupon.max_discount_amount}</span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Min order (discount only) */}
                          {activeTab === 'discount' && (
                            <td className="px-6 py-5 text-xs text-[#A08BA6] font-mono">
                              {coupon.min_order_amount > 0 ? `₹${coupon.min_order_amount}` : '—'}
                            </td>
                          )}

                          {/* Validity */}
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-0.5 text-[11px] text-[#A08BA6] font-mono">
                              <span>{formatDisplayDate(coupon.start_date)}</span>
                              <span className="text-[#D4AF37]/40">→</span>
                              <span>{formatDisplayDate(coupon.end_date)}</span>
                            </div>
                          </td>

                          {/* Usage */}
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-1.5">
                              <span className="text-xs font-mono text-[#FDFBF7]">
                                {coupon.usage_count} <span className="text-[#A08BA6]">/ {coupon.usage_limit ?? '∞'}</span>
                              </span>
                              {coupon.usage_limit && (
                                <div className="w-20 h-1 rounded-full bg-[#D4AF37]/10 overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                      width: `${usagePct}%`,
                                      background: usagePct >= 90 ? '#F43F5E' : usagePct >= 60 ? '#D4AF37' : '#10B981',
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-5">
                            <span
                              className="px-3 py-1.5 text-[9px] font-black tracking-widest uppercase rounded-lg border"
                              style={{ color: status.color, background: status.bg, borderColor: status.border }}
                            >
                              {status.label}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus-within:opacity-100">
                              <button
                                onClick={() => openEdit(coupon)}
                                className="px-3.5 py-2 rounded-lg border border-[#D4AF37]/25 text-[#D4AF37] text-[9px] font-black uppercase tracking-widest hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/50 transition-all cursor-pointer bg-transparent"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleToggle(coupon)}
                                disabled={isToggling}
                                className="px-3.5 py-2 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer bg-transparent disabled:opacity-50"
                                style={
                                  coupon.is_active
                                    ? { borderColor: 'rgba(160,139,166,0.25)', color: '#A08BA6' }
                                    : { borderColor: 'rgba(16,185,129,0.25)', color: '#10B981' }
                                }
                              >
                                {isToggling ? '...' : coupon.is_active ? 'Disable' : 'Enable'}
                              </button>
                              <button
                                onClick={() => handleDelete(coupon)}
                                disabled={isDeleting}
                                className="px-3.5 py-2 rounded-lg border border-[#F43F5E]/25 text-[#F43F5E] text-[9px] font-black uppercase tracking-widest hover:bg-[#F43F5E]/10 hover:border-[#F43F5E]/50 transition-all cursor-pointer bg-transparent disabled:opacity-50"
                              >
                                {isDeleting ? '...' : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Count footer */}
          {!loading && coupons.length > 0 && (
            <div className="px-6 py-4 border-t border-[#D4AF37]/10 bg-[#0a0310]/30 flex items-center justify-between">
              <p className="text-[10px] text-[#A08BA6] uppercase tracking-widest">
                Showing <span className="text-[#D4AF37] font-bold">{coupons.length}</span> {activeTab} coupon{coupons.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={loadCoupons}
                className="text-[10px] text-[#D4AF37]/60 hover:text-[#D4AF37] uppercase tracking-widest transition-colors cursor-pointer bg-transparent border-none font-bold"
              >
                ↻ Refresh
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
