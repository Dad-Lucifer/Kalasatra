import { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../utils/api';
import './ProductsPage.css';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  selling_price: number;
  discount_percentage: number;
  colors: string[];
  sizes: string[];
  images: Array<{ url: string; alt: string; order: number }>;
  thumbnail_url: string;
  stock_status: string;
  category_name: string;
  subcategory_name: string;
  is_featured: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ProductsPageProps {
  isAdminMode?: boolean;
}

const API_BASE = 'http://localhost:5000/api/v1';
const availableColors = ['Red', 'Blue', 'Black', 'White', 'Green', 'Yellow', 'Pink', 'Grey'];
const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductsPage({ isAdminMode = false }: ProductsPageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Add Product Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    subcategory_id: '',
    name: '',
    description: '',
    buying_price: '',
    selling_price: '',
    discount_percentage: '0',
    stock_quantity: '0',
    low_stock_threshold: '10',
    is_featured: false,
    colors: [] as string[],
    sizes: [] as string[],
  });
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; alt: string; order: number }>>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalSubcategories, setModalSubcategories] = useState<Subcategory[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadSubcategories(selectedCategory);
    } else {
      setSubcategories([]);
      setSelectedSubcategory('');
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadProducts();
  }, [
    selectedCategory,
    selectedSubcategory,
    searchQuery,
    minPrice,
    maxPrice,
    selectedColors,
    selectedSizes,
    sortBy,
    sortOrder,
    currentPage,
  ]);

  useEffect(() => {
    if (formData.category_id) {
      const cat = categories.find((c) => c.id === formData.category_id);
      if (cat) loadModalSubcategories(cat.slug);
    } else {
      setModalSubcategories([]);
    }
  }, [formData.category_id]);

  const loadCategories = async () => {
    const res = await apiRequest('/products/categories');
    if (res.success && res.data) {
      setCategories(res.data);
    }
  };

  const loadSubcategories = async (categorySlug: string) => {
    const res = await apiRequest(`/products/categories/${categorySlug}/subcategories`);
    if (res.success && res.data) {
      setSubcategories(res.data);
    }
  };

  const loadModalSubcategories = async (categorySlug: string) => {
    const res = await apiRequest(`/products/categories/${categorySlug}/subcategories`);
    if (res.success && res.data) {
      setModalSubcategories(res.data);
    }
  };

  const loadProducts = async () => {
    setLoading(true);

    const params = new URLSearchParams();
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedSubcategory) params.append('subcategory', selectedSubcategory);
    if (searchQuery) params.append('search', searchQuery);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (selectedColors.length > 0) params.append('colors', selectedColors.join(','));
    if (selectedSizes.length > 0) params.append('sizes', selectedSizes.join(','));
    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);
    params.append('page', currentPage.toString());
    params.append('limit', '12');

    const res = await apiRequest(`/products?${params.toString()}`);
    setLoading(false);

    if (res.success && res.data) {
      setProducts(res.data);
      setPagination(res.pagination!);
    }
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
    setCurrentPage(1);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedColors([]);
    setSelectedSizes([]);
    setCurrentPage(1);
  };

  const calculateDiscountedPrice = (price: number, discount: number) => {
    return price - (price * discount) / 100;
  };

  const handleEditProduct = (productId: string) => {
    console.log('Edit product:', productId);
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;

    const res = await apiRequest(`/products/${productId}`, {
      method: 'DELETE',
    });

    if (res.success) {
      alert('Product deleted successfully');
      loadProducts();
    } else {
      alert(`Failed to delete product: ${res.message}`);
    }
  };

  // ─── Image Upload ──────────────────────────────────────────────────────

  const getAuthHeaders = () => {
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
        const newImages: Array<{ url: string; alt: string; order: number }> = data.data.map(
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

  // ─── Form Helpers ──────────────────────────────────────────────────────

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

  const resetForm = () => {
    setFormData({
      category_id: '',
      subcategory_id: '',
      name: '',
      description: '',
      buying_price: '',
      selling_price: '',
      discount_percentage: '0',
      stock_quantity: '0',
      low_stock_threshold: '10',
      is_featured: false,
      colors: [],
      sizes: [],
    });
    setUploadedImages([]);
    setModalSubcategories([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.selling_price || !formData.category_id) {
      alert('Please fill in required fields: Name, Selling Price, and Category');
      return;
    }

    setSubmitting(true);

    const payload = {
      category_id: formData.category_id,
      subcategory_id: formData.subcategory_id || null,
      name: formData.name,
      description: formData.description,
      buying_price: parseFloat(formData.buying_price) || 0,
      selling_price: parseFloat(formData.selling_price),
      discount_percentage: parseFloat(formData.discount_percentage) || 0,
      colors: formData.colors,
      sizes: formData.sizes,
      images: uploadedImages,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      low_stock_threshold: parseInt(formData.low_stock_threshold) || 10,
      is_featured: formData.is_featured,
    };

    const res = await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (res.success) {
      alert('Product created successfully!');
      setShowModal(false);
      resetForm();
      loadProducts();
    } else {
      alert(`Failed to create product: ${res.message}`);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="products-page">
      {/* Header */}
      <div className="products-header">
        <h1>{isAdminMode ? 'Product Management' : 'Shop Our Collection'}</h1>
        <p>{isAdminMode ? 'Manage your product catalog' : 'Discover the latest trends in fashion'}</p>
        {isAdminMode && (
          <button
            className="add-product-btn"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            style={{
              marginTop: '16px',
              padding: '12px 24px',
              backgroundColor: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            + Add New Product
          </button>
        )}
      </div>

      <div className="products-container">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <div className="filters-header">
            <h3>Filters</h3>
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear All
            </button>
          </div>

          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {subcategories.length > 0 && (
            <div className="filter-group">
              <label>Subcategory</label>
              <select
                value={selectedSubcategory}
                onChange={(e) => {
                  setSelectedSubcategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="filter-select"
              >
                <option value="">All Subcategories</option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.slug}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="filter-group">
            <label>Price Range</label>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setCurrentPage(1);
                }}
                className="price-input"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setCurrentPage(1);
                }}
                className="price-input"
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Colors</label>
            <div className="color-filters">
              {availableColors.map((color) => (
                <button
                  key={color}
                  className={`color-btn ${selectedColors.includes(color) ? 'active' : ''}`}
                  onClick={() => toggleColor(color)}
                  style={{
                    backgroundColor: color.toLowerCase(),
                    border: selectedColors.includes(color) ? '3px solid var(--accent)' : '2px solid var(--border)',
                  }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Sizes</label>
            <div className="size-filters">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  className={`size-btn ${selectedSizes.includes(size) ? 'active' : ''}`}
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="products-main">
          <div className="products-toolbar">
            <div className="results-info">
              {pagination && (
                <span>
                  Showing {(pagination.page - 1) * pagination.limit + 1}-
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
                </span>
              )}
            </div>
            <div className="sort-controls">
              <label>Sort by:</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="sort-select"
              >
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="selling_price-asc">Price: Low to High</option>
                <option value="selling_price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <p>No products found matching your filters.</p>
              <button onClick={clearFilters} className="clear-btn">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map((product) => (
                  <div key={product.id} className="product-card">
                    {product.is_featured && <span className="featured-badge">Featured</span>}
                    {product.discount_percentage > 0 && (
                      <span className="discount-badge">-{product.discount_percentage}%</span>
                    )}

                    <div className="product-image">
                      <img
                        src={product.thumbnail_url || product.images[0]?.url || '/placeholder.png'}
                        alt={product.name}
                        loading="lazy"
                      />
                      <div className="product-overlay">
                        <button
                          className="view-btn"
                          onClick={() => (window.location.href = `/products/${product.slug}`)}
                        >
                          View Details
                        </button>
                        {isAdminMode && (
                          <div className="admin-actions" style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                            <button
                              className="edit-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProduct(product.id);
                              }}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="delete-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProduct(product.id, product.name);
                              }}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="product-info">
                      <div className="product-category">{product.category_name}</div>
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-description">
                        {product.description?.substring(0, 80)}
                        {product.description?.length > 80 && '...'}
                      </p>

                      <div className="product-meta">
                        <div className="product-colors">
                          {product.colors.slice(0, 4).map((color, idx) => (
                            <span
                              key={idx}
                              className="color-dot"
                              style={{ backgroundColor: color.toLowerCase() }}
                              title={color}
                            />
                          ))}
                          {product.colors.length > 4 && <span className="more-colors">+{product.colors.length - 4}</span>}
                        </div>
                        <div className="product-sizes">
                          {product.sizes.slice(0, 3).join(', ')}
                          {product.sizes.length > 3 && ` +${product.sizes.length - 3}`}
                        </div>
                      </div>

                      <div className="product-footer">
                        <div className="product-price">
                          {product.discount_percentage > 0 ? (
                            <>
                              <span className="price-original">₹{product.selling_price.toFixed(2)}</span>
                              <span className="price-discounted">
                                ₹{calculateDiscountedPrice(product.selling_price, product.discount_percentage).toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="price-current">₹{product.selling_price.toFixed(2)}</span>
                          )}
                        </div>
                        <div className={`stock-status ${product.stock_status}`}>
                          {product.stock_status === 'in_stock' && '✓ In Stock'}
                          {product.stock_status === 'low' && '⚠ Low Stock'}
                          {product.stock_status === 'out' && '✗ Out of Stock'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>

                  <div className="page-numbers">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        className={`page-number ${currentPage === page ? 'active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={currentPage === pagination.totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Product</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
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

              {/* Image Upload — replaces separate thumbnail input */}
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
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitting || uploading}
                >
                  {submitting ? 'Creating...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
