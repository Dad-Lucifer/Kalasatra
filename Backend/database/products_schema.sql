-- Product Management Schema for Kalasatra
-- Run this in your Supabase SQL Editor after the users table

-- ═══════════════════════════════════════════════════════════════════════════
-- CATEGORIES TABLE
-- ═══════════════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS categories CASCADE;

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- Insert main categories
INSERT INTO categories (name, slug, description, display_order) VALUES
  ('Men''s Collection', 'mens-collection', 'Stylish clothing for men', 1),
  ('Women''s Collection', 'womens-collection', 'Elegant clothing for women', 2),
  ('Kids Collection', 'kids-collection', 'Comfortable clothing for kids', 3);

-- ═══════════════════════════════════════════════════════════════════════════
-- SUBCATEGORIES TABLE
-- ═══════════════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS subcategories CASCADE;

CREATE TABLE subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT,
  UNIQUE(category_id, slug)
);

-- Create index for faster lookups
CREATE INDEX idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX idx_subcategories_slug ON subcategories(slug);

-- ═══════════════════════════════════════════════════════════════════════════
-- PRODUCTS TABLE
-- ═══════════════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS products CASCADE;

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
  
  -- Basic Info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sku TEXT UNIQUE,
  description TEXT,
  
  -- Pricing
  buying_price DECIMAL(10, 2) NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL,
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  gst_percentage DECIMAL(5, 2) DEFAULT 0,
  
  -- Product Details
  colors TEXT[] DEFAULT ARRAY[]::TEXT[],
  sizes TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Images (Bunny.net URLs)
  images JSONB DEFAULT '[]'::JSONB,
  thumbnail_url TEXT,
  
  -- Inventory
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT,
  
  -- Constraints
  CONSTRAINT positive_buying_price CHECK (buying_price >= 0),
  CONSTRAINT positive_selling_price CHECK (selling_price >= 0),
  CONSTRAINT valid_discount CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  CONSTRAINT valid_gst CHECK (gst_percentage >= 0 AND gst_percentage <= 100)
);

-- Create indexes for better performance
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_subcategory_id ON products(subcategory_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Full-text search index
CREATE INDEX idx_products_name_search ON products USING gin(to_tsvector('english', name));
CREATE INDEX idx_products_description_search ON products USING gin(to_tsvector('english', description));

-- ═══════════════════════════════════════════════════════════════════════════
-- PRODUCT VARIANTS TABLE (for size/color combinations)
-- ═══════════════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS product_variants CASCADE;

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Variant Details
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  sku TEXT UNIQUE,
  
  -- Pricing (can override product price)
  price_adjustment DECIMAL(10, 2) DEFAULT 0,
  
  -- Inventory
  stock_quantity INTEGER DEFAULT 0,
  
  -- Images specific to this variant
  images JSONB DEFAULT '[]'::JSONB,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(product_id, size, color)
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);

-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ═══════════════════════════════════════════════════════════════════════════

-- Categories
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Subcategories
DROP TRIGGER IF EXISTS update_subcategories_updated_at ON subcategories;
CREATE TRIGGER update_subcategories_updated_at
  BEFORE UPDATE ON subcategories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Products
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Product Variants
DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════

-- Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active categories" ON categories;
CREATE POLICY "Public can read active categories"
  ON categories FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Service role full access to categories" ON categories;
CREATE POLICY "Service role full access to categories"
  ON categories FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Subcategories
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active subcategories" ON subcategories;
CREATE POLICY "Public can read active subcategories"
  ON subcategories FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Service role full access to subcategories" ON subcategories;
CREATE POLICY "Service role full access to subcategories"
  ON subcategories FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active products" ON products;
CREATE POLICY "Public can read active products"
  ON products FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Service role full access to products" ON products;
CREATE POLICY "Service role full access to products"
  ON products FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Product Variants
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active variants" ON product_variants;
CREATE POLICY "Public can read active variants"
  ON product_variants FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Service role full access to variants" ON product_variants;
CREATE POLICY "Service role full access to variants"
  ON product_variants FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- HELPFUL VIEWS
-- ═══════════════════════════════════════════════════════════════════════════

-- View for products with category and subcategory names
DROP VIEW IF EXISTS products_with_categories;
CREATE VIEW products_with_categories AS
SELECT 
  p.*,
  c.name as category_name,
  c.slug as category_slug,
  sc.name as subcategory_name,
  sc.slug as subcategory_slug,
  (p.selling_price - p.buying_price) as profit_margin,
  CASE 
    WHEN p.stock_quantity <= p.low_stock_threshold THEN 'low'
    WHEN p.stock_quantity = 0 THEN 'out'
    ELSE 'in_stock'
  END as stock_status
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN subcategories sc ON p.subcategory_id = sc.id;

-- ═══════════════════════════════════════════════════════════════════════════
-- COMMENTS FOR DOCUMENTATION
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE categories IS 'Main product categories (Men, Women, Kids)';
COMMENT ON TABLE subcategories IS 'Subcategories under main categories';
COMMENT ON TABLE products IS 'Product catalog with detailed information';
COMMENT ON TABLE product_variants IS 'Size and color variants for products';

COMMENT ON COLUMN products.images IS 'Array of image objects with Bunny.net URLs: [{"url": "...", "alt": "...", "order": 1}]';
COMMENT ON COLUMN products.colors IS 'Available colors for the product';
COMMENT ON COLUMN products.sizes IS 'Available sizes for the product';
COMMENT ON COLUMN products.buying_price IS 'Cost price from supplier';
COMMENT ON COLUMN products.selling_price IS 'Retail price to customer';
