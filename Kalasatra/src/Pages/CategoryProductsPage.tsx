import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import { useCart } from '../context/CartContext';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  selling_price: number;
  discount_percentage: number;
  gst_percentage: number;
  colors: string[];
  sizes: string[];
  images: Array<{ url: string; alt: string; order: number }>;
  thumbnail_url: string;
  stock_quantity: number;
  stock_status: string;
  category_name: string;
  category_slug: string;
}

const categoryMeta: Record<string, { title: string; subtitle: string }> = {
  'mens-collection': { title: "Men's Collection", subtitle: 'Bold. Sharp. Unapologetic.' },
  'womens-collection': { title: "Women's Collection", subtitle: 'Elegance meets edge.' },
  'kids-collection': { title: "Kids Collection", subtitle: 'Mini style, maximum attitude.' },
};

export default function CategoryProductsPage() {
  const navigate = useNavigate();
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { addItem, items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('created_at-desc');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 99999]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, { size: string; color: string }>>({});
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());
  const [rippleIds, setRippleIds] = useState<Set<string>>(new Set());
  const [cartBump, setCartBump] = useState(0);

  const meta = categoryMeta[categorySlug || ''] || {
    title: 'Collection',
    subtitle: 'Premium streetwear',
  };

  useEffect(() => {
    loadProducts();
  }, [categorySlug, sortBy, selectedSizes, selectedColors, priceRange, page]);

  const loadProducts = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (categorySlug) params.append('category', categorySlug);
    const [sortField, sortOrder] = sortBy.split('-');
    params.append('sortBy', sortField);
    params.append('sortOrder', sortOrder);
    if (selectedSizes.length) params.append('sizes', selectedSizes.join(','));
    if (selectedColors.length) params.append('colors', selectedColors.join(','));
    params.append('minPrice', priceRange[0].toString());
    params.append('maxPrice', priceRange[1].toString());
    params.append('page', page.toString());
    params.append('limit', '12');

    const res = await apiRequest(`/products?${params.toString()}`);
    setLoading(false);
    if (res.success && res.data) {
      setProducts(res.data);
      setTotalPages(res.pagination?.totalPages || 1);
    }
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
    setPage(1);
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) => prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]);
    setPage(1);
  };

  const calcPrice = (product: Product) => {
    const discounted = product.discount_percentage > 0
      ? product.selling_price - (product.selling_price * product.discount_percentage) / 100
      : product.selling_price;
    const withGst = discounted + (discounted * product.gst_percentage) / 100;
    return { discounted, final: withGst };
  };

  const handleAddToCart = (product: Product) => {
    if (!localStorage.getItem('accessToken')) {
      navigate('/auth');
      return;
    }
    const variant = selectedVariants[product.id];
    addItem({
      productId: product.id,
      name: product.name,
      price: calcPrice(product).final,
      size: variant?.size || product.sizes[0] || 'M',
      color: variant?.color || product.colors[0] || 'Black',
      image: product.thumbnail_url || product.images[0]?.url || '',
      slug: product.slug,
    });
    setAnimatingIds((prev) => new Set(prev).add(product.id));
    setRippleIds((prev) => new Set(prev).add(product.id));
    setCartBump((prev) => prev + 1);
    setTimeout(() => {
      setAnimatingIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 800);
    setTimeout(() => {
      setRippleIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 600);
  };

  const handleBuyNow = (product: Product) => {
    if (!localStorage.getItem('accessToken')) {
      navigate('/auth');
      return;
    }
    handleAddToCart(product);
    setCartOpen(true);
  };

  const allSizes = [...new Set(products.flatMap((p) => p.sizes))];
  const allColors = [...new Set(products.flatMap((p) => p.colors))];

  return (
    <div className="min-h-screen bg-rich-black">
      {/* Navbar spacer */}
      <div className="h-20 lg:h-24" />

      {/* Header */}
      <section className="relative border-b border-luxury-gold/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(212,175,55,0.06),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-10">
          <div className="flex items-center justify-between">
            <div>
              <Link to="/" className="text-xs uppercase tracking-[0.2em] text-luxury-gold/60 hover:text-luxury-gold transition-colors mb-4 inline-block">
                ← Back to Home
              </Link>
              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-soft-white mt-2">
                {meta.title}
              </h1>
              <p className="text-lg text-soft-white/60 mt-3 font-light">{meta.subtitle}</p>
            </div>
            <button
              onClick={() => setCartOpen(true)}
              className="relative px-6 py-3 border border-luxury-gold/30 text-luxury-gold hover:bg-luxury-gold hover:text-rich-black transition-all duration-300"
            >
              <span className="text-sm font-semibold uppercase tracking-[0.15em]">Cart</span>
              {totalItems > 0 && (
                <span
                  key={cartBump}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-luxury-gold text-rich-black text-xs font-bold flex items-center justify-center animate-cart-bounce"
                >
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 shrink-0 space-y-8">
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-luxury-gold font-semibold mb-4">Sort</h3>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="w-full px-4 py-3 bg-dark-charcoal border border-luxury-gold/20 text-soft-white text-sm outline-none focus:border-luxury-gold/60 transition-colors"
              >
                <option value="created_at-desc">Newest</option>
                <option value="selling_price-asc">Price: Low to High</option>
                <option value="selling_price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
              </select>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-luxury-gold font-semibold mb-4">Price Range</h3>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange[0] || ''}
                  onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                  className="w-full px-4 py-3 bg-dark-charcoal border border-luxury-gold/20 text-soft-white text-sm outline-none focus:border-luxury-gold/60 transition-colors placeholder:text-soft-white/30"
                />
                <span className="text-soft-white/40 self-center">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange[1] === 99999 ? '' : priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 99999])}
                  className="w-full px-4 py-3 bg-dark-charcoal border border-luxury-gold/20 text-soft-white text-sm outline-none focus:border-luxury-gold/60 transition-colors placeholder:text-soft-white/30"
                />
              </div>
            </div>

            {allSizes.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] text-luxury-gold font-semibold mb-4">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border transition-all duration-300 ${
                        selectedSizes.includes(size)
                          ? 'bg-luxury-gold text-rich-black border-luxury-gold'
                          : 'bg-transparent text-soft-white/60 border-luxury-gold/20 hover:border-luxury-gold/50 hover:text-soft-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {allColors.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] text-luxury-gold font-semibold mb-4">Color</h3>
                <div className="flex flex-wrap gap-3">
                  {allColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => toggleColor(color)}
                      title={color}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                        selectedColors.includes(color)
                          ? 'border-luxury-gold scale-110'
                          : 'border-transparent hover:scale-110'
                      }`}
                      style={{ backgroundColor: color.toLowerCase() }}
                    />
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <div className="w-10 h-10 border-2 border-luxury-gold/30 border-t-luxury-gold rounded-full animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-32">
                <p className="text-soft-white/50 text-lg">No products found.</p>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => {
                    const price = calcPrice(product);
                    const variant = selectedVariants[product.id];
                    return (
                      <Link
                        to={`/product/${product.slug}`}
                        key={product.id}
                        className="group relative 
                        h-fit bg-dark-charcoal border border-luxury-gold/10 hover:border-luxury-gold/40 transition-all duration-500 overflow-hidden flex flex-col"
                      >
                        {product.discount_percentage > 0 && (
                          <span className="absolute top-3 right-3 z-10 px-3 py-1 bg-red-600/90 text-white text-xs font-bold uppercase tracking-wider">
                            -{product.discount_percentage}%
                          </span>
                        )}

                        <div className="aspect-4/3 bg-linear-to-b from-dark-charcoal via-rich-black to-dark-charcoal relative overflow-hidden">
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          {product.thumbnail_url || product.images[0]?.url ? (
                            <img
                              src={product.thumbnail_url || product.images[0]?.url}
                              alt={product.name}
                              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-14 h-14 rounded-full border-2 border-luxury-gold/30 flex items-center justify-center">
                                <span className="font-heading text-2xl font-bold text-luxury-gold/50">K</span>
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-linear-to-t from-dark-charcoal via-transparent to-transparent" />
                        </div>

                        <div className="p-4 flex flex-col flex-1 gap-2">
                          <p className="text-[10px] uppercase tracking-[0.15em] text-luxury-gold/60 font-semibold">
                            {product.category_name}
                          </p>
                          <h3 className="font-heading text-base font-bold text-soft-white group-hover:text-luxury-gold transition-colors duration-300 leading-tight">
                            {product.name}
                          </h3>
                          <p className="text-xs text-soft-white/50 line-clamp-1 leading-relaxed">
                            {product.description}
                          </p>

                          {product.sizes.length > 0 && (
                            <div>
                              <p className="text-[10px] text-soft-white/40 uppercase tracking-wider mb-1.5">Size</p>
                              <div className="flex flex-wrap gap-1">
                                {product.sizes.map((size) => (
                                  <button
                                    key={size}
                                    onClick={() =>
                                      setSelectedVariants((prev) => ({
                                        ...prev,
                                        [product.id]: { ...prev[product.id], size, color: variant?.color || product.colors[0] || 'Black' },
                                      }))
                                    }
                                    className={`px-2.5 py-1 text-[10px] font-semibold border transition-all ${
                                      (variant?.size || product.sizes[0]) === size
                                        ? 'bg-luxury-gold text-rich-black border-luxury-gold'
                                        : 'bg-transparent text-soft-white/50 border-luxury-gold/15 hover:border-luxury-gold/40'
                                    }`}
                                  >
                                    {size}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {product.colors.length > 0 && (
                            <div>
                              <p className="text-[10px] text-soft-white/40 uppercase tracking-wider mb-1.5">Color</p>
                              <div className="flex flex-wrap gap-1.5">
                                {product.colors.map((color) => (
                                  <button
                                    key={color}
                                    onClick={() =>
                                      setSelectedVariants((prev) => ({
                                        ...prev,
                                        [product.id]: { ...prev[product.id], color, size: variant?.size || product.sizes[0] || 'M' },
                                      }))
                                    }
                                    title={color}
                                    className={`w-5 h-5 rounded-full border-2 transition-all ${
                                      (variant?.color || product.colors[0]) === color
                                        ? 'border-luxury-gold scale-110'
                                        : 'border-transparent hover:scale-110'
                                    }`}
                                    style={{ backgroundColor: color.toLowerCase() }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-luxury-gold/10">
                            <div>
                              {product.discount_percentage > 0 ? (
                                <div className="flex items-baseline gap-1.5">
                                  <span className="font-heading text-lg font-bold text-luxury-gold">
                                    ₹{price.final.toFixed(2)}
                                  </span>
                                  <span className="text-[10px] text-soft-white/40 line-through">
                                    ₹{product.selling_price.toFixed(2)}
                                  </span>
                                </div>
                              ) : (
                                <span className="font-heading text-lg font-bold text-luxury-gold">
                                  ₹{price.final.toFixed(2)}
                                </span>
                              )}
                              <p className={`text-[10px] font-semibold ${
                                product.stock_status === 'in_stock' ? 'text-green-500' :
                                product.stock_status === 'low' ? 'text-yellow-500' : 'text-red-500'
                              }`}>
                                {product.stock_status === 'in_stock' ? 'In Stock' :
                                 product.stock_status === 'low' ? 'Low Stock' : 'Out of Stock'}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleAddToCart(product); }}
                              disabled={product.stock_status === 'out'}
                              className="relative flex-1 px-3 py-2.5 border-2 border-luxury-gold text-luxury-gold font-bold uppercase tracking-[0.12em] text-[10px] hover:bg-luxury-gold hover:text-rich-black transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden"
                            >
                              <span className={`transition-transform duration-300 inline-block ${animatingIds.has(product.id) ? 'scale-110' : ''}`}>
                                Add to Cart
                              </span>
                              {rippleIds.has(product.id) && (
                                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <span className="w-0 h-0 rounded-full border-2 border-[#D4AF37] animate-ping absolute" />
                                </span>
                              )}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleBuyNow(product); }}
                              disabled={product.stock_status === 'out'}
                              className="flex-1 px-3 py-2.5 bg-[#D4AF37] text-rich-black font-bold uppercase tracking-[0.12em] text-[10px] hover:bg-gold-light transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Buy Now
                            </button>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-12">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] border border-[#D4AF37]/30 text-luxury-gold hover:bg-luxury-gold hover:text-rich-black transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-10 h-10 text-sm font-semibold transition-all duration-300 ${
                            page === p
                              ? 'bg-[#D4AF37] text-rich-black'
                              : 'border border-[#D4AF37]/20 text-soft-white/60 hover:border-[#D4AF37]/50'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] border border-luxury-gold/30 text-luxury-gold hover:bg-luxury-gold hover:text-rich-black transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Cart Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-all  duration-500 ${
          cartOpen ? 'visible' : 'invisible'
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-500 ${
            cartOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setCartOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 h-full w-full max-w-md bg-[#e1e1e1] border-l  border-luxury-gold/20 transition-transform duration-500 ${
            cartOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-luxury-gold/10">
            <h2 className="font-heading text-xl font-bold text-soft-white">
              Cart ({totalItems})
            </h2>
            <button
              onClick={() => setCartOpen(false)}
              className="text-soft-white/50 hover:text-soft-white text-2xl leading-none bg-transparent border-none p-0 cursor-pointer"
            >
              &times;
            </button>
          </div>

          <div className="flex flex-col h-[calc(100%-140px)] overflow-y-auto px-6 py-6 space-y-4">
            {items.length === 0 ? (
              <p className="text-soft-white/40 text-center py-20">Your cart is empty.</p>
            ) : (
              items.map((item) => (
                <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4 pb-4 border-b border-luxury-gold/10">
                  <div className="w-20 h-20 shrink-0 bg-rich-black border border-luxury-gold/10 flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-heading text-xl font-bold text-luxury-gold/30">K</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-soft-white truncate">{item.name}</p>
                    <p className="text-xs text-soft-white/50 mt-0.5">
                      {item.size} / {item.color}
                    </p>
                    <p className="text-sm font-bold text-luxury-gold mt-1">₹{item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-luxury-gold/20">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.color, -1)}
                          className="px-2.5 py-1 text-soft-white/60 hover:text-soft-white bg-transparent border-none cursor-pointer text-sm"
                        >
                          −
                        </button>
                        <span className="px-3 py-1 text-sm text-soft-white min-w-[24px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.color, 1)}
                          className="px-2.5 py-1 text-soft-white/60 hover:text-soft-white bg-transparent border-none cursor-pointer text-sm"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.size, item.color)}
                        className="text-xs text-soft-white/30 hover:text-red-400 transition-colors bg-transparent border-none p-0 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 px-6 py-5 border-t border-luxury-gold/10 bg-dark-charcoal">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-soft-white/70">Total</span>
                <span className="font-heading text-xl font-bold text-luxury-gold">₹{totalPrice.toFixed(2)}</span>
              </div>
              <button className="w-full px-6 py-3.5 bg-luxury-gold text-rich-black font-bold uppercase tracking-[0.2em] text-sm hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] transition-all duration-500">
                Checkout
              </button>
              <button
                onClick={clearCart}
                className="w-full mt-2 px-6 py-2.5 border border-luxury-gold/20 text-soft-white/50 font-semibold uppercase tracking-[0.1em] text-xs hover:text-red-400 hover:border-red-400/30 transition-all duration-300 bg-transparent cursor-pointer"
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
