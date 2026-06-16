/**
 * processOrder — Creates an order, splits revenue (platform fee, commission, vendor payout),
 * updates affiliate link stats, product sales counters, and returns the completed order.
 *
 * POST /processOrder
 * Body: { product_id, affiliate_link_code? }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const PLATFORM_FEE_RATE = 0.10; // 10% platform fee

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { product_id, affiliate_link_code } = body;

    if (!product_id) return Response.json({ error: 'product_id is required' }, { status: 400 });

    // 1. Fetch product
    const products = await base44.asServiceRole.entities.Product.filter({ id: product_id }, null, 1);
    const product = products[0];
    if (!product) return Response.json({ error: 'Product not found' }, { status: 404 });
    if (product.status !== 'approved') return Response.json({ error: 'Product not available' }, { status: 400 });

    const salePrice = product.sale_price && product.sale_price < product.price ? product.sale_price : product.price;

    // 2. Revenue split calculations
    const platformFee = Math.round(salePrice * PLATFORM_FEE_RATE * 100) / 100;
    const commissionRate = (product.commission_rate || 0) / 100;
    const commissionAmount = Math.round(salePrice * commissionRate * 100) / 100;
    const vendorPayout = Math.round((salePrice - platformFee - commissionAmount) * 100) / 100;

    // 3. Resolve affiliate link (if provided)
    let affiliateLink = null;
    let affiliate_id = null;
    let affiliate_link_id = null;

    if (affiliate_link_code) {
      const links = await base44.asServiceRole.entities.AffiliateLink.filter({ link_code: affiliate_link_code }, null, 1);
      if (links.length > 0 && links[0].status === 'active') {
        affiliateLink = links[0];
        affiliate_id = affiliateLink.affiliate_id;
        affiliate_link_id = affiliateLink.id;
      }
    }

    // 4. Generate order number
    const orderNumber = `PV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // 5. Create order
    const order = await base44.asServiceRole.entities.Order.create({
      order_number: orderNumber,
      product_id: product.id,
      product_name: product.name,
      buyer_id: user.id,
      buyer_email: user.email,
      vendor_id: product.vendor_id,
      affiliate_id: affiliate_id || null,
      affiliate_link_id: affiliate_link_id || null,
      amount: salePrice,
      commission_amount: commissionAmount,
      platform_fee: platformFee,
      vendor_payout: vendorPayout,
      status: 'completed',
      currency: 'USD',
    });

    // 6. Update affiliate link stats (clicks already tracked separately, just update conversions + earnings)
    if (affiliateLink) {
      await base44.asServiceRole.entities.AffiliateLink.update(affiliateLink.id, {
        conversions: (affiliateLink.conversions || 0) + 1,
        revenue: Math.round(((affiliateLink.revenue || 0) + salePrice) * 100) / 100,
        commission_earned: Math.round(((affiliateLink.commission_earned || 0) + commissionAmount) * 100) / 100,
      });
    }

    // 7. Update product counters
    await base44.asServiceRole.entities.Product.update(product.id, {
      total_sales: (product.total_sales || 0) + 1,
      total_revenue: Math.round(((product.total_revenue || 0) + salePrice) * 100) / 100,
      gravity_score: Math.min(100, (product.gravity_score || 0) + 1),
    });

    return Response.json({
      success: true,
      order: {
        id: order.id,
        order_number: orderNumber,
        amount: salePrice,
        commission_amount: commissionAmount,
        platform_fee: platformFee,
        vendor_payout: vendorPayout,
        status: 'completed',
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});