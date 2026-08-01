import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { apiRequest, API_BASE_URL } from '../utils/api';

import { COLOR_MAP } from '../constants/colors';

const availableColors = Object.keys(COLOR_MAP);
const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'];

// Encode / decode size entries as "LABEL:measurement" strings for DB storage.
const encodeSizeEntry = (label: string, measurement: string) =>
  measurement.trim() ? `${label}:${measurement.trim()}` : label;

const decodeSizeEntry = (raw: string): { label: string; measurement: string } => {
  const idx = raw.indexOf(':');
  if (idx === -1) return { label: raw, measurement: '' };
  return { label: raw.slice(0, idx), measurement: raw.slice(idx + 1) };
};

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

interface ProductImage {
  url: string;
  alt: string;
  order: number;
}

interface EditProduct {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  subcategory_id: string | null;
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
  is_featured: boolean;
}

interface EditProductModalProps {
  product: EditProduct;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

// ─── Section header component ─────────────────────────────────────────────────
function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="text-base">{icon}</span>
      <span className="text-xs font-bold tracking-[0.12em] uppercase text-[#D4AF37]">{title}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-[#D4AF37]/30 to-transparent" />
    </div>
  );
}

// ─── Styled field label ───────────────────────────────────────────────────────
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold tracking-wide text-[#C0C0C0] mb-1.5 uppercase">
      {children}
      {required && <span className="text-[#D4AF37] ml-1">*</span>}
    </label>
  );
}

// ─── Shared input class ───────────────────────────────────────────────────────
const inputCls =
  'w-full px-3.5 py-2.5 bg-[#111111] border border-[#2A2A2A] rounded-xl text-[#F0F0F0] text-sm placeholder-[#555] outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all duration-200 font-[Outfit]';

const selectCls =
  'w-full px-3.5 py-2.5 bg-[#111111] border border-[#2A2A2A] rounded-xl text-[#F0F0F0] text-sm outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all duration-200 cursor-pointer font-[Outfit]';

export default function EditProductModal({ product, categories, onClose, onSaved }: EditProductModalProps) {
  const [formData, setFormData] = useState({
    category_id: product.category_id,
    subcategory_id: product.subcategory_id || '',
    name: product.name,
    description: product.description || '',
    buying_price: product.buying_price.toString(),
    selling_price: product.selling_price.toString(),
    discount_percentage: product.discount_percentage.toString(),
    gst_percentage: product.gst_percentage.toString(),
    stock_quantity: product.stock_quantity.toString(),
    low_stock_threshold: product.low_stock_threshold.toString(),
    is_featured: product.is_featured,
    colors: product.colors || [] as string[],
    selectedSizeLabels: Array.from(new Set((product.sizes || []).map((s) => decodeSizeEntry(s).label))),
  });
  // Pre-populate measurement inputs from existing encoded size strings (grouped by label)
  const initSizeInputs = (): Record<string, string[]> => {
    const m: Record<string, string[]> = {};
    (product.sizes || []).forEach((s) => {
      const { label, measurement } = decodeSizeEntry(s);
      if (measurement) {
        if (!m[label]) m[label] = [];
        m[label].push(measurement);
      }
    });
    return m;
  };
  const [sizeInputs, setSizeInputs] = useState<Record<string, string[]>>(initSizeInputs);
  const [sizeDraftInput, setSizeDraftInput] = useState<Record<string, string>>({});
  const [uploadedImages, setUploadedImages] = useState<ProductImage[]>(product.images || []);
  const [modalSubcategories, setModalSubcategories] = useState<Subcategory[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (formData.category_id) {
      const cat = categories.find((c) => c.id === formData.category_id);
      if (cat) loadSubcategories(cat.slug);
    }
  }, [formData.category_id]);

  const loadSubcategories = async (categorySlug: string) => {
    const res = await apiRequest(`/products/categories/${categorySlug}/subcategories`);
    if (res.success && res.data) {
      setModalSubcategories(res.data);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleFormColor = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  const toggleFormSize = (label: string) => {
    setFormData((prev) => {
      const active = prev.selectedSizeLabels.includes(label);
      return {
        ...prev,
        selectedSizeLabels: active
          ? prev.selectedSizeLabels.filter((s) => s !== label)
          : [...prev.selectedSizeLabels, label],
      };
    });
    if (formData.selectedSizeLabels.includes(label)) {
      setSizeInputs((prev) => { const n = { ...prev }; delete n[label]; return n; });
      setSizeDraftInput((prev) => { const n = { ...prev }; delete n[label]; return n; });
    }
  };

  const handleAddMeasurement = (label: string) => {
    const val = (sizeDraftInput[label] ?? '').trim();
    if (!val) return;
    setSizeInputs((prev) => ({ ...prev, [label]: [...(prev[label] ?? []), val] }));
    setSizeDraftInput((prev) => ({ ...prev, [label]: '' }));
  };

  const handleRemoveMeasurement = (label: string, idx: number) => {
    setSizeInputs((prev) => ({
      ...prev,
      [label]: (prev[label] ?? []).filter((_, i) => i !== idx),
    }));
  };

  const buildSizesPayload = (): string[] =>
    formData.selectedSizeLabels.flatMap((label) => {
      const measurements = sizeInputs[label] ?? [];
      if (measurements.length === 0) return [label];
      return measurements.map((m) => encodeSizeEntry(label, m));
    });

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const processImageFiles = async (files: FileList) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const form = new FormData();
    for (let i = 0; i < files.length; i++) {
      form.append('images', files[i]);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/upload/images`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: form,
      });
      const data = await res.json();
      if (data.success) {
        const newImages: ProductImage[] = data.data.map(
          (img: any, idx: number) => ({
            url: img.url,
            alt: formData.name || 'Product image',
            order: uploadedImages.length + idx,
          })
        );
        setUploadedImages((prev) => [...prev, ...newImages]);
      } else {
        alert(`Upload failed: ${data.message}`);
      }
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) await processImageFiles(e.target.files);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) await processImageFiles(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      category_id: product.category_id,
      subcategory_id: product.subcategory_id || '',
      name: product.name,
      description: product.description || '',
      buying_price: product.buying_price.toString(),
      selling_price: product.selling_price.toString(),
      discount_percentage: product.discount_percentage.toString(),
      gst_percentage: product.gst_percentage.toString(),
      stock_quantity: product.stock_quantity.toString(),
      low_stock_threshold: product.low_stock_threshold.toString(),
      is_featured: product.is_featured,
      colors: product.colors || [],
      selectedSizeLabels: Array.from(new Set((product.sizes || []).map((s) => decodeSizeEntry(s).label))),
    });
    setSizeInputs(initSizeInputs());
    setSizeDraftInput({});
    setUploadedImages(product.images || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.selling_price || !formData.category_id) {
      alert('Please fill in required fields: Name, Selling Price, and Category');
      return;
    }

    setSubmitting(true);

    let subcategoryName: string | null = null;
    let subcategoryId: string | null = formData.subcategory_id || null;

    if (subcategoryId && subcategoryId.length !== 36) {
      subcategoryName = subcategoryId;
      subcategoryId = null;
    }

    const payload: Record<string, any> = {
      category_id: formData.category_id,
      subcategory_id: subcategoryId,
      subcategory_name: subcategoryName,
      name: formData.name,
      description: formData.description,
      buying_price: parseFloat(formData.buying_price) || 0,
      selling_price: parseFloat(formData.selling_price),
      discount_percentage: parseFloat(formData.discount_percentage) || 0,
      gst_percentage: parseFloat(formData.gst_percentage) || 0,
      colors: formData.colors,
      sizes: buildSizesPayload(),
      images: uploadedImages,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      low_stock_threshold: parseInt(formData.low_stock_threshold) || 10,
      is_featured: formData.is_featured,
    };

    const res = await apiRequest(`/products/${product.id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (res.success) {
      alert('Product updated successfully!');
      onSaved();
      onClose();
    } else {
      alert(`Failed to update product: ${res.message}`);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto py-8"
      style={{ background: 'rgba(0,0,0,0.82)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl mx-4 mb-8 rounded-2xl overflow-hidden"
        style={{
          background: '#1A1A1A',
          border: '1px solid rgba(212,175,55,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            background: 'linear-gradient(90deg, rgba(212,175,55,0.08) 0%, transparent 100%)',
            borderBottom: '1px solid rgba(212,175,55,0.15)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}
            >
              ✏️
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F5F5F5] font-[Syne]">Edit Product</h2>
              <p className="text-[11px] text-[#777] truncate max-w-[300px]">{product.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#666] hover:text-[#F5F5F5] hover:bg-white/5 transition-all cursor-pointer"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            ✕
          </button>
        </div>

        {/* ── Scrollable form body ────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="overflow-y-auto" style={{ maxHeight: '78vh' }}>
          <div className="p-6 space-y-7">

            {/* ── Section: Basic Info ──────────────────────────────────────── */}
            <div>
              <SectionHeader icon="📦" title="Basic Information" />
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Category</FieldLabel>
                    <select
                      value={formData.category_id}
                      onChange={(e) => handleFormChange('category_id', e.target.value)}
                      required
                      className={selectCls}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Subcategory</FieldLabel>
                    <select
                      value={formData.subcategory_id}
                      onChange={(e) => handleFormChange('subcategory_id', e.target.value)}
                      className={selectCls}
                    >
                      <option value="">None</option>
                      {modalSubcategories.map((sub) => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <FieldLabel required>Product Name</FieldLabel>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    required
                    placeholder="e.g. Premium Cotton Kurta"
                    className={inputCls}
                  />
                </div>

                <div>
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    rows={3}
                    placeholder="Describe the product..."
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </div>
            </div>

            {/* ── Section: Pricing ─────────────────────────────────────────── */}
            <div>
              <SectionHeader icon="💰" title="Pricing" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Buying Price', field: 'buying_price', placeholder: '0.00' },
                  { label: 'Selling Price', field: 'selling_price', placeholder: '0.00', required: true },
                  { label: 'Discount %', field: 'discount_percentage', placeholder: '0', max: 100 },
                  { label: 'GST %', field: 'gst_percentage', placeholder: '0', max: 100 },
                ].map(({ label, field, placeholder, required, max }) => (
                  <div key={field}>
                    <FieldLabel required={required}>{label}</FieldLabel>
                    <div className="relative">
                      {field.includes('price') && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555] text-sm pointer-events-none">₹</span>
                      )}
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={max}
                        value={formData[field as keyof typeof formData] as string}
                        onChange={(e) => handleFormChange(field, e.target.value)}
                        required={required}
                        placeholder={placeholder}
                        className={`${inputCls} ${field.includes('price') ? 'pl-7' : ''}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Section: Inventory ───────────────────────────────────────── */}
            <div>
              <SectionHeader icon="📊" title="Inventory" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-end">
                <div>
                  <FieldLabel>Stock Quantity</FieldLabel>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => handleFormChange('stock_quantity', e.target.value)}
                    placeholder="0"
                    className={inputCls}
                  />
                </div>
                <div>
                  <FieldLabel>Low Stock Alert</FieldLabel>
                  <input
                    type="number"
                    min="0"
                    value={formData.low_stock_threshold}
                    onChange={(e) => handleFormChange('low_stock_threshold', e.target.value)}
                    placeholder="10"
                    className={inputCls}
                  />
                </div>
                <div className="pb-0.5">
                  <label
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border ${
                      formData.is_featured
                        ? 'bg-[#D4AF37]/10 border-[#D4AF37]/40 text-[#D4AF37]'
                        : 'bg-[#111] border-[#2A2A2A] text-[#888] hover:border-[#444]'
                    }`}
                  >
                    <span className="text-lg">{formData.is_featured ? '⭐' : '☆'}</span>
                    <span className="text-xs font-semibold tracking-wide uppercase">Featured</span>
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => handleFormChange('is_featured', e.target.checked)}
                      className="hidden"
                    />
                    <div
                      className={`ml-auto w-9 h-5 rounded-full transition-all duration-300 relative ${
                        formData.is_featured ? 'bg-[#D4AF37]' : 'bg-[#333]'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
                          formData.is_featured ? 'left-[18px]' : 'left-0.5'
                        }`}
                      />
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* ── Section: Colors ──────────────────────────────────────────── */}
            <div>
              <SectionHeader icon="🎨" title="Colors" />
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => {
                  const isSelected = formData.colors.includes(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleFormColor(color)}
                      className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full cursor-pointer transition-all ${
                        isSelected
                          ? 'text-[#D4AF37]'
                          : 'text-[#888] hover:text-[#CCC]'
                      }`}
                      style={{
                        background: isSelected ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)',
                        border: isSelected ? '1px solid rgba(212,175,55,0.5)' : '1px solid rgba(255,255,255,0.08)',
                        boxShadow: isSelected ? '0 0 10px rgba(212,175,55,0.1)' : 'none',
                      }}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: COLOR_MAP[color] ?? color.toLowerCase(),
                          border: color === 'White' ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(0,0,0,0.3)',
                          boxShadow: isSelected ? `0 0 6px ${COLOR_MAP[color]}66` : 'none',
                        }}
                      />
                      {color}
                      {isSelected && <span className="text-[10px]">✓</span>}
                    </button>
                  );
                })}
              </div>
              {formData.colors.length > 0 && (
                <p className="mt-2 text-[11px] text-[#666]">
                  {formData.colors.length} color{formData.colors.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {/* ── Section: Sizes ───────────────────────────────────────────── */}
            <div>
              <SectionHeader icon="📐" title="Sizes & Measurements" />
              <p className="text-[11px] text-[#555] mb-3">
                Select sizes, then add optional measurements (e.g. 28″ for waist).
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {availableSizes.map((label) => {
                  const isActive = formData.selectedSizeLabels.includes(label);
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleFormSize(label)}
                      className="px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all"
                      style={{
                        background: isActive ? '#D4AF37' : 'rgba(255,255,255,0.04)',
                        color: isActive ? '#0F0F0F' : '#999',
                        border: isActive ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.08)',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Per-size measurement chips */}
              {formData.selectedSizeLabels.length > 0 && (
                <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-1">
                  {formData.selectedSizeLabels.map((label) => (
                    <div
                      key={label}
                      className="rounded-xl p-3.5 space-y-2.5"
                      style={{
                        background: 'rgba(212,175,55,0.04)',
                        border: '1px solid rgba(212,175,55,0.15)',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2.5 py-0.5 text-[11px] font-black tracking-widest rounded-md"
                          style={{
                            background: 'rgba(212,175,55,0.15)',
                            border: '1px solid rgba(212,175,55,0.4)',
                            color: '#D4AF37',
                          }}
                        >
                          {label}
                        </span>
                        {(sizeInputs[label] ?? []).length > 0 && (
                          <span className="text-[10px] text-[#555]">
                            {(sizeInputs[label] ?? []).length} measurement{(sizeInputs[label] ?? []).length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {/* Existing chips */}
                      {(sizeInputs[label] ?? []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {(sizeInputs[label] ?? []).map((m, i) => (
                            <span
                              key={i}
                              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg"
                              style={{
                                background: 'rgba(212,175,55,0.12)',
                                border: '1px solid rgba(212,175,55,0.3)',
                                color: '#D4AF37',
                              }}
                            >
                              {m}″
                              <button
                                type="button"
                                onClick={() => handleRemoveMeasurement(label, i)}
                                className="w-3.5 h-3.5 flex items-center justify-center rounded-full text-[10px] hover:bg-red-500/20 hover:text-red-400 transition-all bg-transparent border-none cursor-pointer leading-none"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Add input */}
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="e.g. 28"
                          value={sizeDraftInput[label] ?? ''}
                          onChange={(e) =>
                            setSizeDraftInput((prev) => ({ ...prev, [label]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddMeasurement(label);
                            }
                          }}
                          className="w-28 px-3 py-2 bg-[#111] border border-[#2A2A2A] rounded-lg text-[#F0F0F0] text-xs placeholder-[#555] outline-none focus:border-[#D4AF37] transition-colors"
                        />
                        <span className="text-[11px] text-[#555]">inches</span>
                        <button
                          type="button"
                          onClick={() => handleAddMeasurement(label)}
                          className="px-3 py-2 text-[11px] font-bold rounded-lg hover:brightness-110 transition-all border-none cursor-pointer"
                          style={{ background: '#D4AF37', color: '#0F0F0F' }}
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Section: Images ──────────────────────────────────────────── */}
            <div>
              <SectionHeader icon="🖼️" title="Product Images" />

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className="rounded-xl py-8 px-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
                style={{
                  background: dragOver ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.02)',
                  border: dragOver
                    ? '2px dashed rgba(212,175,55,0.6)'
                    : '2px dashed rgba(255,255,255,0.1)',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="text-2xl">{uploading ? '⏳' : '📤'}</div>
                <p className="text-sm font-medium text-[#CCC]">
                  {uploading ? 'Uploading images…' : 'Drop images here or click to browse'}
                </p>
                <p className="text-[11px] text-[#555]">JPG, PNG, WebP, AVIF — max 10 MB each</p>
              </div>

              {/* Image grid */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2.5 mt-3">
                  {uploadedImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden group"
                      style={{ border: idx === 0 ? '2px solid rgba(212,175,55,0.5)' : '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <img src={img.url} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        title="Remove image"
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600/90 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer border-none flex items-center justify-center hover:bg-red-500 hover:scale-110"
                      >
                        ✕
                      </button>
                      {idx === 0 && (
                        <span
                          className="absolute bottom-1.5 left-1.5 px-2 py-0.5 text-[9px] font-black tracking-wider rounded-md"
                          style={{ background: 'rgba(212,175,55,0.9)', color: '#0F0F0F' }}
                        >
                          THUMB
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ── Sticky footer ──────────────────────────────────────────────────── */}
          <div
            className="sticky bottom-0 flex items-center justify-between gap-3 px-6 py-4"
            style={{
              background: 'linear-gradient(0deg, #141414 60%, rgba(20,20,20,0) 100%)',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <p className="text-[11px] text-[#555]">
              Fields marked <span className="text-[#D4AF37]">*</span> are required
            </p>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="px-5 py-2.5 text-sm font-semibold rounded-xl cursor-pointer border border-white/10 text-[#888] bg-transparent hover:text-[#F5F5F5] hover:border-white/25 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || uploading}
                className="px-6 py-2.5 text-sm font-bold rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-[filter]"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #B8962A 100%)',
                  color: '#0F0F0F',
                  border: 'none',
                }}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </span>
                ) : '✓ Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
