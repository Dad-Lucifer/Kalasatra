import { useState } from 'react';
import { createPortal } from 'react-dom';

import { COLOR_MAP } from '../constants/colors';

interface ProductImage {
  url: string;
  alt: string;
  order: number;
}

interface ProductDetails {
  id: string;
  name: string;
  slug: string;
  category_name?: string;
  subcategory_name?: string;
  description: string;
  buying_price: number;
  selling_price: number;
  discount_percentage: number;
  gst_percentage: number;
  colors: string[];
  sizes: string[];
  images: ProductImage[];
  thumbnail_url: string;
  stock_quantity: number;
  low_stock_threshold: number;
  stock_status?: string;
  is_featured: boolean;
}

interface ProductDetailsModalProps {
  product: ProductDetails;
  onClose: () => void;
  onEdit?: (productId: string) => void;
}

const decodeSizeEntry = (raw: string): { label: string; measurement: string } => {
  const idx = raw.indexOf(':');
  if (idx === -1) return { label: raw, measurement: '' };
  return { label: raw.slice(0, idx), measurement: raw.slice(idx + 1) };
};

const formatSize = (raw: string): string => {
  const { label, measurement } = decodeSizeEntry(raw);
  return measurement ? `${label} (${measurement}")` : label;
};

const formatPrice = (value: number) => `₹${value.toFixed(2)}`;

// ─── Info row inside a detail card ───────────────────────────────────────────
function DetailRow({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#666] shrink-0">{label}</span>
      <span className={`text-sm font-medium text-right ${accent ? 'text-[#D4AF37]' : 'text-[#DEDEDE]'}`}>{value}</span>
    </div>
  );
}

// ─── Section card wrapper ─────────────────────────────────────────────────────
function InfoCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">{icon}</span>
        <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#D4AF37]">{title}</span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#D4AF37]/25 to-transparent" />
      </div>
      {children}
    </div>
  );
}

export default function ProductDetailsModal({ product, onClose, onEdit }: ProductDetailsModalProps) {
  const galleryImages = product.images && product.images.length > 0
    ? product.images
    : [{ url: product.thumbnail_url || '/placeholder.png', alt: product.name, order: 0 }];
  const [activeImage, setActiveImage] = useState(0);

  const discountedPrice = product.discount_percentage > 0
    ? product.selling_price - (product.selling_price * product.discount_percentage) / 100
    : product.selling_price;
  const gstAmount = (discountedPrice * product.gst_percentage) / 100;
  const finalPrice = discountedPrice + gstAmount;

  const sizes = product.sizes || [];
  const uniqueSizes = Array.from(new Set(sizes.map(formatSize)));

  const stockLabel =
    product.stock_status === 'low' ? 'Low Stock' :
    product.stock_status === 'out' ? 'Out of Stock' :
    product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock';

  const stockConfig = {
    low:  { bg: 'rgba(234,179,8,0.1)',  border: 'rgba(234,179,8,0.3)',  text: '#EAB308', dot: '#EAB308', icon: '⚠' },
    out:  { bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)',  text: '#EF4444', dot: '#EF4444', icon: '✕' },
    in:   { bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.3)',  text: '#22C55E', dot: '#22C55E', icon: '✓' },
  };
  const stockKey =
    product.stock_status === 'low' ? 'low' :
    (product.stock_status === 'out' || product.stock_quantity <= 0) ? 'out' : 'in';
  const stock = stockConfig[stockKey];

  const margin = product.buying_price > 0
    ? ((product.selling_price - product.buying_price) / product.buying_price) * 100
    : null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto scrollbar-none"
      style={{ background: 'rgba(0,0,0,0.82)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl mx-auto my-auto rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: '#1A1A1A',
          border: '1px solid rgba(212,175,55,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          maxHeight: '92vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-5 sm:px-6 py-4 shrink-0"
          style={{
            background: 'linear-gradient(90deg, rgba(212,175,55,0.07) 0%, transparent 100%)',
            borderBottom: '1px solid rgba(212,175,55,0.12)',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
              style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.28)' }}
            >
              🛍️
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-[#F5F5F5] font-[Syne] tracking-wide">Product Details</h2>
              <p className="text-[11px] text-[#666] truncate">{product.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            {product.is_featured && (
              <span
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold tracking-wider rounded-lg"
                style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.35)', color: '#D4AF37' }}
              >
                ⭐ FEATURED
              </span>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#555] hover:text-[#F0F0F0] hover:bg-white/5 transition-all cursor-pointer"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────────────────── */}
        <div className="overflow-y-auto scrollbar-none flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

            {/* ── Left: Image Gallery ─────────────────────────────────────────── */}
            <div
              className="p-5 space-y-3"
              style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}
            >
              {/* Main image */}
              <div
                className="relative aspect-square rounded-xl overflow-hidden"
                style={{
                  background: '#0E0E0E',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <img
                  src={galleryImages[activeImage]?.url}
                  alt={galleryImages[activeImage]?.alt || product.name}
                  className="w-full h-full object-cover transition-opacity duration-200"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {product.is_featured && (
                    <span
                      className="px-2.5 py-1 text-[10px] font-black tracking-wider rounded-lg"
                      style={{ background: 'rgba(212,175,55,0.9)', color: '#0F0F0F' }}
                    >
                      ⭐ FEATURED
                    </span>
                  )}
                </div>
                {product.discount_percentage > 0 && (
                  <span
                    className="absolute top-3 right-3 px-2.5 py-1 text-[11px] font-black rounded-lg"
                    style={{ background: 'rgba(239,68,68,0.9)', color: '#fff' }}
                  >
                    -{product.discount_percentage}%
                  </span>
                )}

                {/* Image counter */}
                {galleryImages.length > 1 && (
                  <span
                    className="absolute bottom-3 right-3 px-2 py-0.5 text-[10px] font-semibold rounded-md"
                    style={{ background: 'rgba(0,0,0,0.65)', color: '#CCC' }}
                  >
                    {activeImage + 1} / {galleryImages.length}
                  </span>
                )}
              </div>

              {/* Thumbnail strip */}
              {galleryImages.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(idx)}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all"
                      style={{
                        border: activeImage === idx
                          ? '2px solid rgba(212,175,55,0.8)'
                          : '2px solid rgba(255,255,255,0.06)',
                        boxShadow: activeImage === idx ? '0 0 8px rgba(212,175,55,0.25)' : 'none',
                        opacity: activeImage === idx ? 1 : 0.6,
                      }}
                    >
                      <img src={img.url} alt={img.alt || `Image ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Stock badge */}
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                style={{ background: stock.bg, border: `1px solid ${stock.border}` }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: stock.dot, boxShadow: `0 0 6px ${stock.dot}` }}
                />
                <span className="text-xs font-bold tracking-wide" style={{ color: stock.text }}>
                  {stockLabel}
                </span>
                <span className="text-xs ml-auto" style={{ color: stock.text }}>
                  {product.stock_quantity} units
                </span>
              </div>
            </div>

            {/* ── Right: Details ──────────────────────────────────────────────── */}
            <div className="p-5 space-y-4 overflow-y-auto" style={{ maxHeight: '80vh' }}>

              {/* Product title & breadcrumb */}
              <div>
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                  {product.category_name && (
                    <span
                      className="text-[10px] font-bold tracking-[0.12em] uppercase px-2 py-0.5 rounded-md"
                      style={{ color: '#D4AF37', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}
                    >
                      {product.category_name}
                    </span>
                  )}
                  {product.subcategory_name && (
                    <span className="text-[10px] text-[#555]">/ {product.subcategory_name}</span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#F0F0F0] font-[Syne] leading-tight">
                  {product.name}
                </h3>
                <p className="text-[11px] text-[#444] mt-1 font-mono">#{product.slug}</p>
              </div>

              {/* Price block */}
              <div
                className="rounded-xl p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.07) 0%, rgba(212,175,55,0.02) 100%)',
                  border: '1px solid rgba(212,175,55,0.18)',
                }}
              >
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-[#D4AF37] font-[Syne]">
                    {formatPrice(finalPrice)}
                  </span>
                  {product.discount_percentage > 0 && (
                    <span className="text-base text-[#555] line-through">{formatPrice(product.selling_price)}</span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap gap-3 text-[11px]">
                  {product.discount_percentage > 0 && (
                    <span className="text-green-400 font-semibold">
                      ✓ Save {product.discount_percentage}% ({formatPrice(product.selling_price - discountedPrice)})
                    </span>
                  )}
                  {product.gst_percentage > 0 && (
                    <span className="text-[#666]">
                      Incl. {product.gst_percentage}% GST (+{formatPrice(gstAmount)})
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <InfoCard icon="📝" title="Description">
                  <p className="text-sm text-[#BDBDBD] leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </InfoCard>
              )}

              {/* Colors */}
              {(product.colors || []).length > 0 && (
                <InfoCard icon="🎨" title="Available Colors">
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <span
                        key={color}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#CACACA',
                        }}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: COLOR_MAP[color] ?? color.toLowerCase(),
                            border: color === 'White' ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(0,0,0,0.3)',
                            boxShadow: `0 0 5px ${COLOR_MAP[color] ?? '#fff'}55`,
                          }}
                        />
                        {color}
                      </span>
                    ))}
                  </div>
                </InfoCard>
              )}

              {/* Sizes */}
              {uniqueSizes.length > 0 && (
                <InfoCard icon="📐" title="Available Sizes">
                  <div className="flex flex-wrap gap-2">
                    {uniqueSizes.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg tracking-wider"
                        style={{
                          background: 'rgba(212,175,55,0.08)',
                          border: '1px solid rgba(212,175,55,0.2)',
                          color: '#C8A92A',
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </InfoCard>
              )}

              {/* Inventory & Pricing grid */}
              <InfoCard icon="📊" title="Inventory & Pricing">
                <div>
                  <DetailRow label="Stock Qty" value={`${product.stock_quantity} units`} />
                  <DetailRow label="Low Stock Alert" value={`${product.low_stock_threshold} units`} />
                  {product.buying_price > 0 && (
                    <>
                      <DetailRow label="Buying Price" value={formatPrice(product.buying_price)} />
                      <DetailRow label="Selling Price" value={formatPrice(product.selling_price)} />
                      {margin !== null && (
                        <DetailRow
                          label="Margin"
                          value={`${margin.toFixed(1)}%`}
                          accent
                        />
                      )}
                    </>
                  )}
                  {product.discount_percentage > 0 && (
                    <DetailRow label="Discount" value={`${product.discount_percentage}%`} />
                  )}
                  {product.gst_percentage > 0 && (
                    <DetailRow label="GST" value={`${product.gst_percentage}%`} />
                  )}
                </div>
              </InfoCard>

            </div>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 shrink-0"
          style={{
            background: 'rgba(14,14,14,0.95)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <p className="text-[11px] text-[#444] hidden sm:block font-mono">
            ID: {product.id.slice(0, 8)}…
          </p>
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl cursor-pointer border border-white/10 text-[#777] bg-transparent hover:text-[#F0F0F0] hover:border-white/22 transition-colors"
            >
              Close
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(product.id)}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl cursor-pointer hover:brightness-110 transition-[filter]"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #B8962A 100%)',
                  color: '#0F0F0F',
                  border: 'none',
                }}
              >
                <span>✏️</span>
                Edit Product
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
