/**
 * sendWelcomeEmail — Sends a branded welcome email to a newly registered user.
 * Triggered on registration (call from frontend after successful register).
 *
 * POST /sendWelcomeEmail
 * Body: { role } — 'vendor' | 'affiliate' | 'consumer'
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const role = body.role || 'consumer';
    const name = user.full_name || 'there';

    const roleMessages = {
      vendor: {
        subject: 'Welcome to Plenty Value — Start Selling Today!',
        cta: 'Your vendor account is active. Submit your first product for review and start earning.',
        ctaLink: 'https://plentyvalue.com/vendor/products',
        ctaLabel: 'Add Your First Product →',
      },
      affiliate: {
        subject: 'Welcome to Plenty Value — Your Affiliate Journey Starts Now!',
        cta: 'Browse our marketplace, pick products you love, and start sharing your affiliate links.',
        ctaLink: 'https://plentyvalue.com/affiliate/products',
        ctaLabel: 'Browse Products to Promote →',
      },
      consumer: {
        subject: 'Welcome to Plenty Value!',
        cta: 'Explore our curated marketplace of quality products, reviewed and vetted by experts.',
        ctaLink: 'https://plentyvalue.com/marketplace',
        ctaLabel: 'Explore the Marketplace →',
      },
    };

    const msg = roleMessages[role] || roleMessages.consumer;

    const body_html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.07); }
    .header { background: #001845; padding: 36px 40px; text-align: center; }
    .header h1 { color: #81C14B; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
    .header p { color: #94afd0; font-size: 14px; margin: 6px 0 0; }
    .body { padding: 40px; }
    .greeting { font-size: 22px; font-weight: 700; color: #001845; margin-bottom: 16px; }
    .text { font-size: 15px; color: #4a5568; line-height: 1.7; margin-bottom: 24px; }
    .cta { display: inline-block; background: #81C14B; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 32px 0; }
    .footer { padding: 24px 40px; background: #f8fafc; text-align: center; }
    .footer p { font-size: 12px; color: #94a3b8; margin: 4px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Plenty Value</h1>
      <p>Africa's Premier Affiliate Marketplace</p>
    </div>
    <div class="body">
      <p class="greeting">Hey ${name}! 👋</p>
      <p class="text">Welcome to <strong>Plenty Value</strong> — we're thrilled to have you on board.</p>
      <p class="text">${msg.cta}</p>
      <a href="${msg.ctaLink}" class="cta">${msg.ctaLabel}</a>
      <hr class="divider">
      <p class="text" style="font-size:13px; color:#94a3b8;">
        If you have any questions, reply to this email or contact our support team. We're here to help!
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Plenty Value. All rights reserved.</p>
      <p>You received this because you registered on plentyvalue.com</p>
    </div>
  </div>
</body>
</html>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      subject: msg.subject,
      body: body_html,
      from_name: 'Plenty Value',
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});