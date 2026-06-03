"use strict";

const { supabase } = require("../../database/supabase");

const handleError = (res, err, context = "") => {
  console.error(`[ANALYTICS CONTROLLER] ${context}:`, err);
  return res.status(500).json({
    success: false,
    message: err.message || "An internal error occurred.",
  });
};

/**
 * GET /api/v1/admin/analytics
 * Returns computed analytics from product data
 */
const getAnalytics = async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from("products_with_categories")
      .select("*");

    if (error) throw error;

    // Per-category breakdown
    const categoryTotals = {};
    let totalRevenue = 0;
    let totalInvested = 0;

    for (const p of products || []) {
      const cat = p.category_name || "Uncategorized";
      if (!categoryTotals[cat]) {
        categoryTotals[cat] = { count: 0, selling: 0, buying: 0 };
      }
      categoryTotals[cat].count += 1;
      categoryTotals[cat].selling += Number(p.selling_price) || 0;
      categoryTotals[cat].buying += Number(p.buying_price) || 0;
      totalRevenue += Number(p.selling_price) || 0;
      totalInvested += Number(p.buying_price) || 0;
    }

    const ratio =
      totalInvested > 0
        ? parseFloat((totalRevenue / totalInvested).toFixed(2))
        : 0;

    // Monthly / yearly / last-month placeholders (require order system)
    const now = new Date();
    const currentMonth = now.toLocaleString("default", { month: "long", year: "numeric" });
    const currentYear = now.getFullYear();
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = lastMonthDate.toLocaleString("default", { month: "long", year: "numeric" });

    return res.status(200).json({
      success: true,
      data: {
        categoryTotals,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalInvested: parseFloat(totalInvested.toFixed(2)),
        profitMargin: parseFloat((totalRevenue - totalInvested).toFixed(2)),
        ratio,
        productCount: products?.length || 0,
        monthlyIncome: { label: currentMonth, value: 0 },
        yearlyIncome: { label: String(currentYear), value: 0 },
        lastMonthIncome: { label: lastMonth, value: 0 },
        onlineVsCod: { online: 0, cod: 0 },
      },
    });
  } catch (err) {
    return handleError(res, err, "getAnalytics");
  }
};

module.exports = { getAnalytics };
