/**
 * subscribeNewsletter — Subscribes an email to the newsletter and sends a confirmation email.
 * Works for both logged-in and anonymous users (public endpoint, no auth required).
 *
 * POST /subscribeNewsletter
 * Body: { email, name?, interests?, source? }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { email, name, interests, source } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Check if already subscribed
    const existing = await base44.asServiceRole.entities.NewsletterSubscriber.filter({ email }, null, 1);
    if (existing.length > 0) {
      if (existing[0].status === 'active') {
        return Response.json({ success: true, already_subscribed: true });
      }
      // Re-activate unsubscribed user
      await base44.asServiceRole.entities.NewsletterSubscriber.update(existing[0].id, { status: 'active' });
    } else {
      await base44.asServiceRole.entities.NewsletterSubscriber.create({
        email,
        name: name || null,
        interests: interests || [],
        status: 'active',
        source: source || 'website',
      });
    }

    // Send confirmation email
    const displayName = name || 'there';
    const confirmationHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.07); }
    .header { background: #001845; padding: 36px 40px; text-align: center; }
    .header h1 { color: #81C14B; font-size: 28px; font-weight: 800; margin: 0; }
    .header p { color: #94afd0; font-size: 14px; margin: 6px 0 0; }
    .body { padding: 40px; }
    .greeting { font-size: 22px; font-weight: 700; color: #001845; margin-bottom: 16px; }
    .text { font-size: 15px; color: #4a5568; line-height: 1.7; margin-bottom: 16px; }
    .highlight { background: #f0f9e8; border-left: 4px solid #81C14B; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 24px 0; }
    .highlight p { margin: 0; font-size: 14px; color: #2d5a27; }
    .cta { display: inline-block; background: #001845; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; }
    .footer { padding: 24px 40px; background: #f8fafc; text-align: center; }
    .footer p { font-size: 12px; color: #94a3b8; margin: 4px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Plenty Value</h1>
      <p>Expert Product Reviews & Deals Newsletter</p>
    </div>
    <div class="body">
      <p class="greeting">Welcome, ${displayName}! 🎉</p>
      <p class="text">You're now subscribed to the <strong>Plenty Value Newsletter</strong> — your weekly source of expert-curated product reviews, trending deals, and insider affiliate insights.</p>
      <div class="highlight">
        <p>✅ Expert product reviews, vetted for quality<br>
           📈 Trending affiliate opportunities<br>
           💡 Tips to grow your online income<br>
           🛍️ Exclusive deals and early access offers</p>
      </div>
      <p class="text">Expect your first edition soon. In the meantime, explore our marketplace:</p>
      <a href="https://plentyvalue.com/marketplace" class="cta">Browse the Marketplace →</a>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Plenty Value. All rights reserved.</p>
      <p>You can unsubscribe at any time by replying "UNSUBSCRIBE" to this email.</p>
    </div>
  </div>
</body>
</html>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject: "You're subscribed to Plenty Value Newsletter! 🎉",
      body: confirmationHtml,
      from_name: 'Plenty Value Newsletter',
    });

    return Response.json({ success: true, already_subscribed: false });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});