import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../utils/api';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  selling_price: number;
  discount_percentage: number;
  gst_percentage: number;
  colors: string[];
  thumbnail_url: string;
  category_slug: string;
  stock_quantity: number;
  is_featured: boolean;
}

export default function NewAndPopular() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [activeTab, categories]);

  const fetchCategories = async () => {
    const res = await apiRequest('/products/categories');
    if (res.success && res.data) {
      setCategories(res.data);
    }
  };

  const loadProducts = async () => {
    // Only load if categories are fetched (to avoid race conditions on initial load)
    if (categories.length === 0 && activeTab !== 'ALL') return;

    setLoading(true);
    
    const params = new URLSearchParams();
    params.append('sortBy', 'created_at');
    params.append('sortOrder', 'desc');
    params.append('page', '1');
    params.append('limit', '10');

    // If activeTab is not ALL, find the category based on short names
    const getShortName = (name: string) => name.split(' ')[0].replace(/'s/i, 'S').toUpperCase();
    
    const activeCategory = categories.find(c => getShortName(c.name) === activeTab);
    if (activeCategory) {
      params.append('category', activeCategory.slug);
    }

    const res = await apiRequest(`/products?${params.toString()}`);
    setLoading(false);
    if (res.success && res.data) {
      const allowedSlugs = categories.map(c => c.slug);
      
      const seen = new Set<string>();
      const uniqueProducts = res.data.filter((p: Product) => {
        // Only show products that match the active categories strictly
        if (activeTab === 'ALL') {
          if (!allowedSlugs.includes(p.category_slug)) return false;
        } else {
          if (!activeCategory || p.category_slug !== activeCategory.slug) return false;
        }

        // Deduplicate by name to prevent multiple entries of the same product from showing
        const identifier = p.name ? p.name.trim().toLowerCase() : p.id;
        if (seen.has(identifier)) return false;
        seen.add(identifier);
        return true;
      });
      setProducts(uniqueProducts);
    }
  };

  const calcPrice = (product: Product) => {
    const discounted = product.discount_percentage > 0
      ? product.selling_price - (product.selling_price * product.discount_percentage) / 100
      : product.selling_price;
    const withGst = discounted + (discounted * product.gst_percentage) / 100;
    return withGst;
  };

  const formatPrice = (price: number) => {
    return `₹${Math.round(price).toLocaleString('en-IN')}`;
  };

  const getShortName = (name: string) => name.split(' ')[0].replace(/'s/i, 'S').toUpperCase();
  const tabs = ['ALL', ...categories.map(c => getShortName(c.name))];

  if (loading && products.length === 0) {
    return (
      <section className="w-full bg-pure-white py-10 lg:py-16">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="flex justify-center mb-6">
            <h2 className="text-2xl lg:text-3xl font-heading font-bold tracking-widest uppercase text-deep-black">
              NEW AND POPULAR
            </h2>
          </div>
          <div className="flex justify-center">
            <div className="animate-pulse text-gray-400">Loading products...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-pure-white py-10 lg:py-16">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        
        {/* Section Title */}
        <div className="flex justify-center mb-6">
          <h2 className="text-2xl lg:text-3xl font-heading font-bold tracking-widest uppercase text-deep-black">
            NEW AND POPULAR
          </h2>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex overflow-x-auto hide-scrollbar gap-2 sm:gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-none px-4 sm:px-5 py-1.5 text-[10px] sm:text-xs font-bold tracking-widest uppercase border border-deep-black transition-colors ${
                  activeTab === tab
                    ? 'bg-deep-black text-pure-white'
                    : 'bg-pure-white text-deep-black hover:bg-cold-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-5 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
          {products.map((product) => (
            <div key={product.id} className="group cursor-pointer flex flex-col">
              
              {/* Product Image Box */}
              <div className="relative aspect-[3/4] bg-cold-white overflow-hidden mb-3 border border-transparent group-hover:border-cold-grey-light transition-colors">
                <Link to={`/product/${product.slug}`}>
                  <img 
                    src={product.thumbnail_url} 
                    alt={product.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${product.stock_quantity > 0 ? 'group-hover:scale-105' : 'opacity-70 grayscale'}`}
                  />
                  {product.stock_quantity === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
                      <span className="bg-deep-black text-pure-white px-3 py-1 text-xs font-bold uppercase tracking-widest">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  {product.discount_percentage > 0 && product.stock_quantity > 0 && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      -{Math.round(product.discount_percentage)}%
                    </div>
                  )}
                </Link>
                
                {/* Wishlist Heart Icon */}
                <button className="absolute top-3 right-3 p-1 text-gray-500 hover:text-red-500 transition-colors z-10">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
              </div>

              {/* Product Info */}
              <div className="flex flex-col flex-1 px-1">
                <h3 className="text-xs sm:text-sm text-cold-grey font-medium truncate mb-1 uppercase tracking-wider" title={product.name}>
                  {product.name}
                </h3>
                <span className="text-sm sm:text-base text-deep-black font-bold mb-2 flex items-center gap-2">
                  {formatPrice(calcPrice(product))}
                  {product.discount_percentage > 0 && (
                    <span className="text-[10px] sm:text-xs text-cold-grey line-through font-normal">
                      {formatPrice(product.selling_price + (product.selling_price * product.gst_percentage / 100))}
                    </span>
                  )}
                </span>

                {/* Color Swatches (if any) */}
                {product.colors && product.colors.length > 0 && (
                  <div className="flex items-center gap-1 mt-auto">
                    {product.colors.slice(0, 3).map((color, idx) => (
                      <div 
                        key={idx} 
                        className="w-3 h-3 sm:w-3.5 sm:h-3.5 border border-cold-grey-light"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    {product.colors.length > 3 && (
                      <span className="text-[10px] text-gray-500 ml-1 font-medium">
                        +{product.colors.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
