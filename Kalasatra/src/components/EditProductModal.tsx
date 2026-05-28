import { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../utils/api';

const availableColors = ['Red', 'Blue', 'Black', 'White', 'Green', 'Yellow', 'Pink', 'Grey'];
const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

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

const API_BASE = 'http://localhost:5000/api/v1';

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
    sizes: product.sizes || [] as string[],
  });
  const [uploadedImages, setUploadedImages] = useState<ProductImage[]>(product.images || []);
  const [modalSubcategories, setModalSubcategories] = useState<Subcategory[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  const toggleFormSize = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const form = new FormData();
    for (let i = 0; i < files.length; i++) {
      form.append('images', files[i]);
    }

    try {
      const res = await fetch(`${API_BASE}/upload/images`, {
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
      sizes: product.sizes || [],
    });
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
      sizes: formData.sizes,
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Product</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.category_id}
                onChange={(e) => handleFormChange('category_id', e.target.value)}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Subcategory</label>
              <select
                value={formData.subcategory_id}
                onChange={(e) => handleFormChange('subcategory_id', e.target.value)}
              >
                <option value="">None</option>
                {modalSubcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Buying Price</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.buying_price}
                onChange={(e) => handleFormChange('buying_price', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Selling Price *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.selling_price}
                onChange={(e) => handleFormChange('selling_price', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Discount %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discount_percentage}
                onChange={(e) => handleFormChange('discount_percentage', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>GST %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.gst_percentage}
                onChange={(e) => handleFormChange('gst_percentage', e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) => handleFormChange('stock_quantity', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Low Stock Threshold</label>
              <input
                type="number"
                min="0"
                value={formData.low_stock_threshold}
                onChange={(e) => handleFormChange('low_stock_threshold', e.target.value)}
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => handleFormChange('is_featured', e.target.checked)}
                />
                Featured Product
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Colors</label>
            <div className="chip-group">
              {availableColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`chip ${formData.colors.includes(color) ? 'active' : ''}`}
                  onClick={() => toggleFormColor(color)}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Sizes</label>
            <div className="chip-group">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`chip ${formData.sizes.includes(size) ? 'active' : ''}`}
                  onClick={() => toggleFormSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Product Images</label>
            <div className="upload-area">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Choose Images'}
              </button>
              <span className="upload-hint">Supports JPG, PNG, WebP, AVIF (max 10MB each)</span>
            </div>

            {uploadedImages.length > 0 && (
              <div className="image-preview-grid">
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="image-preview-item">
                    <img src={img.url} alt={`Product ${idx + 1}`} />
                    <button
                      type="button"
                      className="image-remove-btn"
                      onClick={() => removeImage(idx)}
                      title="Remove image"
                    >
                      &times;
                    </button>
                    {idx === 0 && <span className="thumbnail-badge">Thumbnail</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={submitting || uploading}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
