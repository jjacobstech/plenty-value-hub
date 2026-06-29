/**
 * getPlatformStats — Admin-only: returns aggregated platform KPIs
 * (GMV, revenue, user counts, top products, affiliate performance).
 *
 * POST /getPlatformStats
 * Body: {} (no params needed)
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    // Fetch all data in parallel
    const [orders, products, users, affiliateLinks, subscribers] = await Promise.all([
      base44.asServiceRole.entities.Order.list('-created_date', 500),
      base44.asServiceRole.entities.Product.list('-created_date', 500),
      base44.asServiceRole.entities.User.list('-created_date', 500),
      base44.asServiceRole.entities.AffiliateLink.list('-created_date', 500),
      base44.asServiceRole.entities.NewsletterSubscriber.list('-created_date', 500),
    ]);

    // Order stats
    const completedOrders = orders.filter(o => o.status === 'completed');
    const gmv = completedOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const platformRevenue = completedOrders.reduce((sum, o) => sum + (o.platform_fee || 0), 0);
    const totalCommissions = completedOrders.reduce((sum, o) => sum + (o.commission_amount || 0), 0);
    const refundedOrders = orders.filter(o => o.status === 'refunded').length;
    const refundRate = orders.length > 0 ? Math.round((refundedOrders / orders.length) * 1000) / 10 : 0;

    // User breakdown
    const vendorCount = users.filter(u => u.role === 'vendor').length;
    const affiliateCount = users.filter(u => u.role === 'affiliate').length;
    const consumerCount = users.filter(u => u.role === 'consumer').length;
    const adminCount = users.filter(u => u.role === 'admin').length;

    // Product stats
    const approvedProducts = products.filter(p => p.status === 'approved').length;
    const pendingProducts = products.filter(p => p.status === 'pending').length;

    // Top 5 products by revenue
    const topProducts = [...products]
      .sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0))
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        name: p.name,
        total_sales: p.total_sales || 0,
        total_revenue: p.total_revenue || 0,
        commission_rate: p.commission_rate || 0,
        category: p.category,
      }));

    // Top 5 affiliates by commission earned
    const affiliateEarnings = {};
    completedOrders.forEach(o => {
      if (o.affiliate_id) {
        affiliateEarnings[o.affiliate_id] = (affiliateEarnings[o.affiliate_id] || 0) + (o.commission_amount || 0);
      }
    });
    const topAffiliates = Object.entries(affiliateEarnings)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([affiliate_id, earned]) => ({ affiliate_id, earned: Math.round(earned * 100) / 100 }));

    // Revenue by category
    const revenueByCategory = {};
    completedOrders.forEach(o => {
      const product = products.find(p => p.id === o.product_id);
      if (product) {
        const cat = product.category || 'other';
        revenueByCategory[cat] = (revenueByCategory[cat] || 0) + (o.amount || 0);
      }
    });

    return Response.json({
      success: true,
      stats: {
        orders: {
          total: orders.length,
          completed: completedOrders.length,
          refunded: refundedOrders,
          refund_rate: refundRate,
        },
        financials: {
          gmv: Math.round(gmv * 100) / 100,
          platform_revenue: Math.round(platformRevenue * 100) / 100,
          total_commissions: Math.round(totalCommissions * 100) / 100,
        },
        users: {
          total: users.length,
          vendors: vendorCount,
          affiliates: affiliateCount,
          consumers: consumerCount,
          admins: adminCount,
        },
        products: {
          total: products.length,
          approved: approvedProducts,
          pending: pendingProducts,
        },
        subscribers: {
          total: subscribers.length,
          active: subscribers.filter(s => s.status === 'active').length,
        },
        affiliate_links: {
          total: affiliateLinks.length,
          active: affiliateLinks.filter(l => l.status === 'active').length,
          total_clicks: affiliateLinks.reduce((sum, l) => sum + (l.clicks || 0), 0),
          total_conversions: affiliateLinks.reduce((sum, l) => sum + (l.conversions || 0), 0),
        },
        top_products: topProducts,
        top_affiliates: topAffiliates,
        revenue_by_category: revenueByCategory,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});