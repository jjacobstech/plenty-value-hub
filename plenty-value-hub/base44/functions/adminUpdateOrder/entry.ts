/**
 * adminUpdateOrder — Admin-only: updates an order status and sends notification emails
 * to the buyer and vendor when order is completed or refunded.
 *
 * POST /adminUpdateOrder
 * Body: { order_id, status: 'completed' | 'refunded' | 'cancelled' | 'pending' }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const body = await req.json();
    const { order_id, status } = body;

    if (!order_id || !status) return Response.json({ error: 'order_id and status are required' }, { status: 400 });

    const validStatuses = ['completed', 'refunded', 'cancelled', 'pending'];
    if (!validStatuses.includes(status)) return Response.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });

    // Fetch existing order
    const orders = await base44.asServiceRole.entities.Order.filter({ id: order_id }, null, 1);
    if (!orders.length) return Response.json({ error: 'Order not found' }, { status: 404 });
    const order = orders[0];

    const oldStatus = order.status;
    if (oldStatus === status) return Response.json({ success: true, message: 'No change needed' });

    // Update order
    await base44.asServiceRole.entities.Order.update(order_id, { status });

    // If moving to refunded, reverse affiliate commission stats
    if (status === 'refunded' && order.affiliate_link_id) {
      const links = await base44.asServiceRole.entities.AffiliateLink.filter({ id: order.affiliate_link_id }, null, 1);
      if (links.length > 0) {
        const link = links[0];
        await base44.asServiceRole.entities.AffiliateLink.update(link.id, {
          conversions: Math.max(0, (link.conversions || 0) - 1),
          revenue: Math.max(0, Math.round(((link.revenue || 0) - (order.amount || 0)) * 100) / 100),
          commission_earned: Math.max(0, Math.round(((link.commission_earned || 0) - (order.commission_amount || 0)) * 100) / 100),
        });
      }
    }

    // If moving to refunded, reverse product sales counter
    if (status === 'refunded' && order.product_id) {
      const products = await base44.asServiceRole.entities.Product.filter({ id: order.product_id }, null, 1);
      if (products.length > 0) {
        const product = products[0];
        await base44.asServiceRole.entities.Product.update(product.id, {
          total_sales: Math.max(0, (product.total_sales || 0) - 1),
          total_revenue: Math.max(0, Math.round(((product.total_revenue || 0) - (order.amount || 0)) * 100) / 100),
        });
      }
    }

    // Send notification emails for significant status changes
    if ((status === 'completed' || status === 'refunded') && order.buyer_email) {
      const subject = status === 'completed'
        ? `Order ${order.order_number} Confirmed — Plenty Value`
        : `Refund Processed for Order ${order.order_number} — Plenty Value`;

      const emailBody = status === 'completed'
        ? `<p>Your order <strong>${order.order_number}</strong> for <strong>${order.product_name}</strong> has been confirmed. Amount: <strong>$${order.amount?.toFixed(2)}</strong>. Thank you for shopping with Plenty Value!</p>`
        : `<p>Your refund for order <strong>${order.order_number}</strong> (${order.product_name}) has been processed. Amount: <strong>$${order.amount?.toFixed(2)}</strong>. Please allow 5–10 business days for the refund to reflect.</p>`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: order.buyer_email,
        subject,
        body: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:40px auto;padding:20px;"><h2 style="color:#001845;">Plenty Value</h2>${emailBody}<p style="margin-top:24px;font-size:13px;color:#999;">© ${new Date().getFullYear()} Plenty Value</p></body></html>`,
        from_name: 'Plenty Value',
      });
    }

    return Response.json({
      success: true,
      order_id,
      old_status: oldStatus,
      new_status: status,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});