"use strict";

const { supabase } = require("../../database/supabase");

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generate URL-friendly slug from text
 */
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Standardised error handler
 */
const handleError = (res, err, context = "") => {
  console.error(`[PRODUCT CONTROLLER] ${context}:`, err);
  
  return res.status(500).json({
    success: false,
    message: err.message || "An internal error occurred.",
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY CONTROLLERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/v1/products/categories
 * Get all active categories
 */
const getCategories = async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (err) {
    return handleError(res, err, "getCategories");
  }
};

/**
 * GET /api/v1/products/categories/:slug/subcategories
 * Get subcategories for a category
 */
const getSubcategories = async (req, res) => {
  try {
    const { slug } = req.params;

    // Get category first
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (categoryError || !category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    // Get subcategories
    const { data: subcategories, error } = await supabase
      .from("subcategories")
      .select("*")
      .eq("category_id", category.id)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: subcategories,
    });
  } catch (err) {
    return handleError(res, err, "getSubcategories");
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT CONTROLLERS - PUBLIC
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/v1/products
 * Get all products with filters and pagination
 */
const getProducts = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      search,
      minPrice,
      maxPrice,
      colors,
      sizes,
      featured,
      page = 1,
      limit = 20,
      sortBy = "created_at",
      sortOrder = "desc",
    } = req.query;

    let query = supabase
      .from("products_with_categories")
      .select("*", { count: "exact" })
      .eq("is_active", true);

    // Filters
    if (category) {
      query = query.eq("category_slug", category);
    }

    if (subcategory) {
      query = query.eq("subcategory_slug", subcategory);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (minPrice) {
      query = query.gte("selling_price", parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte("selling_price", parseFloat(maxPrice));
    }

    if (colors) {
      const colorArray = colors.split(",");
      query = query.overlaps("colors", colorArray);
    }

    if (sizes) {
      const sizeArray = sizes.split(",");
      query = query.overlaps("sizes", sizeArray);
    }

    if (featured === "true") {
      query = query.eq("is_featured", true);
    }

    // Sorting
    const validSortFields = ["created_at", "selling_price", "name"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "created_at";
    const ascending = sortOrder === "asc";

    query = query.order(sortField, { ascending });

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    query = query.range(offset, offset + limitNum - 1);

    const { data: products, error, count } = await query;

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (err) {
    return handleError(res, err, "getProducts");
  }
};

/**
 * GET /api/v1/products/:slug
 * Get single product by slug
 */
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const { data: product, error } = await supabase
      .from("products_with_categories")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Get variants
    const { data: variants, error: variantsError } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", product.id)
      .eq("is_active", true);

    if (variantsError) {
      console.error("Failed to fetch variants:", variantsError);
    }

    return res.status(200).json({
      success: true,
      data: {
        ...product,
        variants: variants || [],
      },
    });
  } catch (err) {
    return handleError(res, err, "getProductBySlug");
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT CONTROLLERS - ADMIN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/v1/products
 * Create new product (Admin only)
 */
const createProduct = async (req, res) => {
  try {
    const {
      category_id,
      subcategory_id,
      name,
      description,
      buying_price,
      selling_price,
      discount_percentage,
      colors,
      sizes,
      images,
      thumbnail_url,
      stock_quantity,
      low_stock_threshold,
      is_featured,
      meta_title,
      meta_description,
      meta_keywords,
    } = req.body;

    const slug = generateSlug(name);
    const sku = `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        category_id,
        subcategory_id,
        name,
        slug,
        sku,
        description,
        buying_price,
        selling_price,
        discount_percentage: discount_percentage || 0,
        colors: colors || [],
        sizes: sizes || [],
        images: images || [],
      thumbnail_url: thumbnail_url || (images && images.length > 0 ? images[0].url : null),
      stock_quantity: stock_quantity || 0,
        low_stock_threshold: low_stock_threshold || 10,
        is_featured: is_featured || false,
        meta_title,
        meta_description,
        meta_keywords: meta_keywords || [],
        created_by: req.user?.sub,
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: product,
    });
  } catch (err) {
    return handleError(res, err, "createProduct");
  }
};

/**
 * PUT /api/v1/products/:id
 * Update product (Admin only)
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Update slug if name changed
    if (updateData.name) {
      updateData.slug = generateSlug(updateData.name);
    }

    // Auto-derive thumbnail_url from first image if not explicitly provided
    if (!updateData.thumbnail_url && updateData.images && updateData.images.length > 0) {
      updateData.thumbnail_url = updateData.images[0].url;
    }

    updateData.updated_by = req.user?.sub;
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.created_by;

    const { data: product, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });
  } catch (err) {
    return handleError(res, err, "updateProduct");
  }
};

/**
 * DELETE /api/v1/products/:id
 * Delete product (Admin only)
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (err) {
    return handleError(res, err, "deleteProduct");
  }
};

/**
 * POST /api/v1/products/:productId/variants
 * Create product variant (Admin only)
 */
const createProductVariant = async (req, res) => {
  try {
    const { productId } = req.params;
    const { size, color, sku, price_adjustment, stock_quantity, images } = req.body;

    const { data: variant, error } = await supabase
      .from("product_variants")
      .insert({
        product_id: productId,
        size,
        color,
        sku: sku || `VAR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        price_adjustment: price_adjustment || 0,
        stock_quantity: stock_quantity || 0,
        images: images || [],
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: "Product variant created successfully.",
      data: variant,
    });
  } catch (err) {
    return handleError(res, err, "createProductVariant");
  }
};

/**
 * POST /api/v1/products/categories
 * Create subcategory (Admin only)
 */
const createSubcategory = async (req, res) => {
  try {
    const { category_id, name, description, display_order } = req.body;

    const slug = generateSlug(name);

    const { data: subcategory, error } = await supabase
      .from("subcategories")
      .insert({
        category_id,
        name,
        slug,
        description,
        display_order: display_order || 0,
        created_by: req.user?.sub,
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: "Subcategory created successfully.",
      data: subcategory,
    });
  } catch (err) {
    return handleError(res, err, "createSubcategory");
  }
};

module.exports = {
  // Public
  getCategories,
  getSubcategories,
  getProducts,
  getProductBySlug,
  
  // Admin
  createProduct,
  updateProduct,
  deleteProduct,
  createProductVariant,
  createSubcategory,
};
