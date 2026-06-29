/**
 * trackAffiliateClick — Records a click on an affiliate link.
 * Called when a visitor lands on /ref/:link_code.
 *
 * POST /trackAffiliateClick
 * Body: { link_code }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { link_code } = body;

    if (!link_code) return Response.json({ error: 'link_code is required' }, { status: 400 });

    const links = await base44.asServiceRole.entities.AffiliateLink.filter({ link_code }, null, 1);
    if (!links.length) return Response.json({ error: 'Link not found' }, { status: 404 });

    const link = links[0];
    if (link.status !== 'active') return Response.json({ error: 'Link is not active' }, { status: 400 });

    // Increment clicks
    await base44.asServiceRole.entities.AffiliateLink.update(link.id, {
      clicks: (link.clicks || 0) + 1,
    });

    // Return the product ID so the frontend can redirect the visitor
    return Response.json({
      success: true,
      product_id: link.product_id,
      affiliate_link_id: link.id,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});