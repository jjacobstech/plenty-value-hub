/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import {
  authThrottle,
  signupThrottle,
  adminThrottle,
  apiThrottle,
  trackingThrottle,
  webhookThrottle,
  campaignThrottle,
} from '#start/limiter'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

/**
 * SEO
 */
router.get('/sitemap.xml', [controllers.Seo, 'sitemap'])
router.get('/robots.txt', [controllers.Seo, 'robots'])

/**
 * Public pages
 */
router.get('/', [controllers.Pages, 'home']).as('home')
router.get('/marketplace', [controllers.Pages, 'marketplace']).as('marketplace')
router.get('/reviews', [controllers.Pages, 'reviews']).as('reviews')
router.get('/product/:id', [controllers.Pages, 'productDetail']).as('product.detail')
router.get('/ref/:link_code', [controllers.Pages, 'affiliateRedirect']).as('affiliate.redirect')
router.get('/for-partners', [controllers.Pages, 'forPartners']).as('for.partners')
router.get('/privacy', [controllers.Pages, 'privacyPolicy']).as('privacy')
router.get('/track-order', [controllers.Pages, 'trackOrder']).as('track.order')
router.get('/login', [controllers.Session, 'create']).as('legacy.login')
router.get('/register', [controllers.NewAccount, 'create']).as('legacy.register')
router.get('/forgot-password', [controllers.Pages, 'forgotPassword']).as('legacy.forgot.password')
router.get('/reset-password', [controllers.Pages, 'resetPassword']).as('legacy.reset.password')
router.get('/verify-email', [controllers.Pages, 'verifyEmail']).as('legacy.verify.email')

/**
 * Auth routes (guest only)
 */
router
  .group(() => {
    // Sign up flow — stricter per-IP throttle to slow account creation
    router.get('/signup', [controllers.NewAccount, 'create']).as('register')
    router.post('/signup', [controllers.NewAccount, 'store']).use(signupThrottle)
    router.post('/signup/step1', [controllers.NewAccount, 'registerStep1']).use(signupThrottle)
    router.post('/signup/step2', [controllers.NewAccount, 'registerStep2']).use(signupThrottle)
    router.post('/signup/step3', [controllers.NewAccount, 'registerStep3']).use(signupThrottle)
    router.post('/signup/verify-otp', [controllers.NewAccount, 'verifyOtp']).use(authThrottle)
    router.post('/signup/resend-otp', [controllers.NewAccount, 'resendOtp']).use(authThrottle)

    // Login — throttled per IP
    router.get('/login', [controllers.Session, 'create']).as('login')
    router.post('/login', [controllers.NewAccount, 'login']).use(authThrottle)

    // Email verification (OTP)
    router.get('/verify-email', [controllers.Pages, 'verifyEmail']).as('verify.email')

    // Password reset — throttled per IP
    router.get('/forgot-password', [controllers.Pages, 'forgotPassword']).as('forgot.password')
    router.post('/forgot-password', [controllers.NewAccount, 'forgotPassword']).use(authThrottle)
    router.get('/reset-password', [controllers.Pages, 'resetPassword']).as('reset.password')
    router.post('/reset-password', [controllers.NewAccount, 'resetPassword']).use(authThrottle)

    // OAuth routes
    router.get('/google', [controllers.Oauth, 'redirectToGoogle']).as('google.redirect')
    router
      .get('/google/callback', [controllers.Oauth, 'handleGoogleCallback'])
      .as('google.callback')
  })
  .prefix('/auth')
  .use(middleware.guest())

/**
 * Protected routes (auth required)
 */
router
  .group(() => {
    router.post('/logout', [controllers.Session, 'destroy']).as('logout')
  })
  .use(middleware.auth())

/**
 * Admin auth routes (separate from main auth — no guest middleware)
 */
router
  .group(() => {
    router.get('/login', [controllers.AdminAuth, 'loginPage']).as('admin.auth.login')

    // First-time setup — blocked by singleAdmin middleware if an admin already exists
    router
      .get('/setup/google', [controllers.AdminAuth, 'redirectToGoogleSetup'])
      .as('admin.auth.setup.google')
      .use(middleware.singleAdmin())

    // Returning admin login via Google
    router
      .get('/login/google', [controllers.AdminAuth, 'redirectToGoogleLogin'])
      .as('admin.auth.login.google')
      .use(authThrottle)

    // Callback for the googleAdmin Ally provider (separate from user OAuth)
    router
      .get('/google/callback', [controllers.AdminAuth, 'handleGoogleCallback'])
      .as('admin.auth.callback')
  })
  .prefix('/admin/auth')

// Convenience alias: /admin/login → /admin/auth/login
router.get('/admin/login', ({ response }) => response.redirect('/admin/auth/login'))

/**
 * Admin routes — use adminAuth so unauthenticated requests redirect to /admin/auth/login
 */
router
  .group(() => {
    router.get('/', [controllers.Pages, 'adminDashboard']).as('admin.dashboard')
    router.get('/users', [controllers.Pages, 'adminUsers']).as('admin.users')
    router.get('/products', [controllers.Pages, 'adminProducts']).as('admin.products')
    router.get('/orders', [controllers.Pages, 'adminOrders']).as('admin.orders')
    router.get('/analytics', [controllers.Pages, 'adminAnalytics']).as('admin.analytics')
    router.get('/subscribers', [controllers.Pages, 'adminSubscribers']).as('admin.subscribers')
    router.get('/blog', [controllers.Pages, 'adminBlog']).as('admin.blog')
    router.get('/newsletters', [controllers.Pages, 'adminNewsletterList']).as('admin.newsletters')
    router.get('/newsletter', [controllers.Pages, 'adminNewsletter']).as('admin.newsletter')
    router
      .get('/email-campaigns', [controllers.Pages, 'adminEmailCampaigns'])
      .as('admin.email.campaigns')
    router.get('/conversions', [controllers.Pages, 'adminConversions']).as('admin.conversions')
    router.get('/hero-banner', [controllers.Pages, 'adminHeroBanner']).as('admin.hero.banner')
    router
      .get('/payment-settings', [controllers.Pages, 'adminPaymentSettings'])
      .as('admin.payment.settings')
    router.get('/payouts', [controllers.Pages, 'adminPayouts']).as('admin.payouts')
  })
  .prefix('/admin')
  .use(middleware.adminAuth())
  .use(middleware.role(['admin']))

/**
 * Vendor routes
 */
router
  .group(() => {
    router.get('/', [controllers.Pages, 'vendorDashboard']).as('vendor.dashboard')
    router.get('/products', [controllers.Pages, 'vendorProducts']).as('vendor.products')
    router.get('/orders', [controllers.Pages, 'vendorOrders']).as('vendor.orders')
    router.get('/kyc', [controllers.Pages, 'vendorKYC']).as('vendor.kyc')
    router.get('/earnings', [controllers.Pages, 'vendorEarnings']).as('vendor.earnings')
    router.get('/analytics', [controllers.Pages, 'vendorAnalytics']).as('vendor.analytics')
    router.get('/profile', [controllers.Pages, 'vendorProfile']).as('vendor.profile')
  })
  .prefix('/vendor')
  .use(middleware.auth())
  .use(middleware.role(['vendor']))

/**
 * Affiliate routes
 */
router
  .group(() => {
    router.get('/', [controllers.Pages, 'affiliateDashboard']).as('affiliate.dashboard')
    router.get('/products', [controllers.Pages, 'affiliateProducts']).as('affiliate.products')
    router.get('/campaigns/discover', [controllers.Pages, 'campaignDiscovery']).as('affiliate.campaigns.discover')
    router.get('/links', [controllers.Pages, 'affiliateLinks']).as('affiliate.links')
    router.get('/earnings', [controllers.Pages, 'affiliateEarnings']).as('affiliate.earnings')
    router
      .get('/performance', [controllers.Pages, 'affiliatePerformance'])
      .as('affiliate.performance')
    router.get('/profile', [controllers.Pages, 'affiliateProfile']).as('affiliate.profile')
  })
  .prefix('/affiliate')
  .use(middleware.auth())
  .use(middleware.role(['affiliate']))

/**
 * API routes for client-side mutations
 */
router
  .group(() => {
    // ── Public endpoints ──────────────────────────────────────────────
    router.get('/products', [controllers.Products, 'index'])
    router.get('/products/:id', [controllers.Products, 'show'])

    // Campaigns (public endpoints) - rate limited to prevent scraping
    router.get('/campaigns', [controllers.Campaigns, 'discover']).use(campaignThrottle)
    router.get('/campaigns/:id', [controllers.Campaigns, 'show']).use(campaignThrottle)

    // Shopify OAuth callback
    router.get('/shopify/callback', [controllers.Shopify, 'handleCallback'])

    // Purchase destination redirects (public)
    router.get('/purchase-destinations/:token/redirect', [controllers.PurchaseDestinations, 'handleRedirect'])

    router.post('/newsletters/subscribe', [controllers.Newsletters, 'subscribe'])
    router.post('/newsletters/unsubscribe', [controllers.Newsletters, 'unsubscribe'])
    router.post('/affiliate-links/track-click', [controllers.AffiliateLinks, 'trackClick']).as('affiliate_links.track_click').use(trackingThrottle)
    router.get('/reviews', [controllers.Reviews, 'index'])

    // Currency endpoints (public)
    router.get('/currencies', [controllers.Currency, 'listCurrencies'])
    router.get('/currencies/:code', [controllers.Currency, 'getCurrency'])
    router.post('/currencies/convert', [controllers.Currency, 'convertCurrency'])
    router.get('/currencies/:code/regions', [controllers.Currency, 'getSupportedRegions'])
    router.get('/currencies/rates/:from/:to', [controllers.Currency, 'getExchangeRateHistory'])
    router.get('/payment-settings', [controllers.SiteSettings, 'paymentConfig'])
    router.get('/payment-providers', [controllers.Payment, 'providers'])
    router.post('/payments/initialize', [controllers.Payment, 'initialize'])
    router.post('/payments/verify', [controllers.Payment, 'verify'])
    router.post('/orders/track', [controllers.Orders, 'trackOrder'])
    router.get('/orders/download', [controllers.Orders, 'downloadDigitalAsset'])

    // Affiliate recruitment (public)
    router.get('/affiliates/top-performers', [controllers.Affiliates, 'getTopPerformers'])
    router.get('/affiliates/tier/:tier', [controllers.Affiliates, 'getAffiliatesByTier'])

    // Mobile API endpoints (public)
    router.get('/mobile/config', [controllers.MobileApi, 'getAppConfig'])
    router.get('/mobile/device-info', [controllers.MobileApi, 'getDeviceInfo'])
    router.get('/mobile/health', [controllers.MobileApi, 'healthCheck'])
    router.get('/mobile/help', [controllers.MobileApi, 'getHelp'])
    router.post('/mobile/errors/report', [controllers.MobileApi, 'reportError'])

    // ── Webhook endpoints (no auth — secured by signature verification) ──
    // Order matters: AdonisJS matches in registration order, so the named
    // provider routes must come BEFORE the ':provider' catch-all or they
    // will never be reached.
    router
      .post('/payments/webhook/stripe', [controllers.Webhook, 'stripeWebhook'])
      .use(webhookThrottle)
    router
      .post('/payments/webhook/paystack', [controllers.Webhook, 'paystackWebhook'])
      .use(webhookThrottle)
    router
      .post('/payments/webhook/flutterwave', [controllers.Webhook, 'flutterwaveWebhook'])
      .use(webhookThrottle)
    router
      .post('/payments/webhook/paypal', [controllers.Webhook, 'paypalWebhook'])
      .use(webhookThrottle)
    router.post('/payments/webhook/:provider', [controllers.Webhook, 'handleWebhook']).use(webhookThrottle)

    // ── Authenticated endpoints ───────────────────────────────────────
    router
      .group(() => {
        // Products (vendor)
        router.post('/products', [controllers.Products, 'store']).use(apiThrottle)
        router.put('/products/:id', [controllers.Products, 'update']).use(apiThrottle)
        router.delete('/products/:id', [controllers.Products, 'destroy']).use(apiThrottle)

        // Campaigns (vendor)
        router.post('/campaigns', [controllers.Campaigns, 'create']).use(apiThrottle)
        router.put('/campaigns/:id', [controllers.Campaigns, 'update']).use(apiThrottle)
        router.post('/campaigns/:id/submit', [controllers.Campaigns, 'submit']).use(apiThrottle)
        router.post('/campaigns/:id/pause', [controllers.Campaigns, 'pause'])
        router.post('/campaigns/:id/resume', [controllers.Campaigns, 'resume'])
        router.get('/campaigns/vendor', [controllers.Campaigns, 'vendorCampaigns'])

        // Campaigns (affiliate)
        router.post('/campaigns/:id/join', [controllers.Campaigns, 'join'])
        router.get('/affiliate-campaigns', [controllers.Campaigns, 'affiliateCampaigns'])

        // Purchase destinations (vendor configuration)
        router.put('/campaigns/:campaignId/purchase-destination', [controllers.PurchaseDestinations, 'configureCampaignDestination'])
        router.post('/campaigns/:campaignId/purchase-destination-link', [controllers.PurchaseDestinations, 'generateRedirectLink'])
        router.get('/campaigns/:campaignId/purchase-destination-stats', [controllers.PurchaseDestinations, 'getStats'])

        // External conversion reporting (vendor webhook endpoint)
        router.post('/campaigns/:campaignId/report-conversion', [controllers.PurchaseDestinations, 'recordConversion'])

        // Vendor conversion reporting API
        router.post('/campaigns/:campaignId/conversions', [controllers.VendorConversions, 'reportConversion'])
        router.get('/campaigns/:campaignId/conversions', [controllers.VendorConversions, 'index'])
        router.get('/conversions/:id', [controllers.VendorConversions, 'show'])
        router.post('/conversions/:id/dispute', [controllers.VendorConversions, 'dispute'])
        router.get('/campaigns/:campaignId/conversions/stats', [controllers.VendorConversions, 'getStats'])

        // Commission ledger (affiliate earnings tracking)
        router.get('/commissions', [controllers.CommissionLedger, 'index'])
        router.get('/commissions/:id', [controllers.CommissionLedger, 'show'])
        router.post('/commissions/:id/dispute', [controllers.CommissionLedger, 'dispute'])
        router.get('/commissions/stats', [controllers.CommissionLedger, 'getStats'])
        router.get('/commissions/campaign/:campaignId/stats', [controllers.CommissionLedger, 'campaignStats'])

        // Refunds and chargebacks (vendor reporting)
        router.post('/refunds-chargebacks/report', [controllers.RefundsChargebacks, 'report'])
        router.get('/refunds-chargebacks', [controllers.RefundsChargebacks, 'index'])
        router.get('/refunds-chargebacks/:id', [controllers.RefundsChargebacks, 'show'])
        router.get('/refunds-chargebacks/stats', [controllers.RefundsChargebacks, 'getStats'])

        // Payments

        // Orders
        router.get('/orders', [controllers.Orders, 'index'])
        router.get('/orders/:id', [controllers.Orders, 'show'])
        router.post('/orders', [controllers.Orders, 'processOrder'])
        router.put('/orders/:id', [controllers.Orders, 'updateStatus']).as('vendor.orders.update')
        router.post('/orders/:id/notify-vendor', [controllers.Orders, 'notifyVendor'])

        // Affiliate Links
        router.get('/affiliate-links', [controllers.AffiliateLinks, 'index'])
        router.post('/affiliate-links', [controllers.AffiliateLinks, 'create'])
        router.get('/affiliate-links/:id', [controllers.AffiliateLinks, 'show'])
        router.put('/affiliate-links/:id', [controllers.AffiliateLinks, 'update'])
        router.delete('/affiliate-links/:id', [controllers.AffiliateLinks, 'destroy'])
        router.get('/affiliate-links/:id/metrics', [controllers.AffiliateLinks, 'metrics'])
        router.get('/affiliate-links/:id/conversions', [controllers.AffiliateLinks, 'conversions'])

        // Click and Conversion Tracking
        router.post('/clicks/track/:slug', [controllers.AffiliateLinks, 'trackClick']).as('affiliate_links.track_click_slug')
        router.post('/conversions/report', [controllers.AffiliateLinks, 'reportConversion'])

        // Reviews
        router.post('/reviews', [controllers.Reviews, 'store'])

        // Profile updates
        router.put('/profile/affiliate', [controllers.Profile, 'updateAffiliate'])
        router.put('/profile/vendor', [controllers.Profile, 'updateVendor'])
        router.post('/profile/upload-image', [controllers.Profile, 'uploadImage'])

        // File uploads (unified upload controller)
        router.post('/uploads/product-image', [controllers.Upload, 'uploadProductImage'])
        router.post('/uploads/product-gallery', [controllers.Upload, 'uploadProductGallery'])
        router.post('/uploads/digital-asset', [controllers.Upload, 'uploadDigitalAsset'])
        router.post('/uploads/profile-image', [controllers.Upload, 'uploadProfileImage'])
        router.post('/uploads/admin-image', [controllers.Upload, 'uploadAdminImage'])
        router.post('/uploads/video', [controllers.Upload, 'uploadVideo'])
        router.post('/uploads/document', [controllers.Upload, 'uploadDocument'])
        router.post('/uploads/file', [controllers.Upload, 'uploadFile'])

        // Wallet & payouts (vendor / affiliate)
        router.get('/wallet', [controllers.Payouts, 'wallet'])
        router.post('/payouts', [controllers.Payouts, 'requestPayout'])
        router.get('/payouts/history', [controllers.Payouts, 'history'])
        router.get('/payouts/:id', [controllers.Payouts, 'show'])
        router.post('/payment-methods', [controllers.Payouts, 'addPaymentMethod'])
        router.get('/payment-methods', [controllers.Payouts, 'paymentMethods'])

        // Notifications
        router.get('/notifications', [controllers.Notifications, 'index'])
        router.get('/notifications/unread', [controllers.Notifications, 'getUnreadCount'])
        router.get('/notifications/:id', [controllers.Notifications, 'show'])
        router.patch('/notifications/:id/read', [controllers.Notifications, 'markAsRead'])
        router.patch('/notifications/read-all', [controllers.Notifications, 'markAllAsRead'])
        router.delete('/notifications/:id', [controllers.Notifications, 'destroy'])
        router.delete('/notifications', [controllers.Notifications, 'destroyAll'])

        // ── Admin endpoints ─────────────────────────────────────────
        router
          .group(() => {
            // Admin dashboard
            router.get('/dashboard/overview', [controllers.AdminDashboard, 'overview'])
            router.get('/dashboard/pending-campaigns', [controllers.AdminDashboard, 'pendingCampaigns'])
            router.get('/dashboard/recent-conversions', [controllers.AdminDashboard, 'recentConversions'])
            router.get('/dashboard/users', [controllers.AdminDashboard, 'users'])
            router.get('/dashboard/commissions', [controllers.AdminDashboard, 'commissionStats'])
            router.get('/dashboard/payouts', [controllers.AdminDashboard, 'payoutStats'])
            router.get('/dashboard/campaigns', [controllers.AdminDashboard, 'topCampaigns'])
            router.get('/dashboard/affiliates', [controllers.AdminDashboard, 'topAffiliates'])
            router.get('/dashboard/financial', [controllers.AdminDashboard, 'financialOverview'])
            router.get('/dashboard/health', [controllers.AdminDashboard, 'systemHealth'])
            router.get('/dashboard/activity', [controllers.AdminDashboard, 'platformActivity'])

            router.get('/stats', [controllers.Admin, 'getPlatformStats'])
            router.get('/auth-status', [controllers.Admin, 'authStatus'])
            router.get('/debug/banks', [controllers.Admin, 'debugPaystackBanks'])
            router.post('/debug/test-email', [controllers.Admin, 'testEmail'])
            router.put('/products/:id/approve', [controllers.Products, 'approve'])

            // Campaign management (admin approval/suspension)
            router.post('/campaigns/:id/approve', [controllers.Campaigns, 'approve'])
            router.post('/campaigns/:id/reject', [controllers.Campaigns, 'reject'])

            // Conversion management (admin approval/rejection)
            router.put('/conversions/:id/approve', [controllers.VendorConversions, 'approve'])
            router.put('/conversions/:id/reject', [controllers.VendorConversions, 'reject'])
            router.post('/conversions/:id/reverse', [controllers.VendorConversions, 'reverse'])

            // Commission ledger management (admin)
            router.post('/commissions/:id/approve', [controllers.CommissionLedger, 'approve'])
            router.post('/commissions/:id/reject', [controllers.CommissionLedger, 'reject'])
            router.post('/commissions/:id/mark-paid', [controllers.CommissionLedger, 'markAsPaid'])
            router.post('/commissions/bulk-approve', [controllers.CommissionLedger, 'bulkApprove'])

            // Refund and chargeback management (admin)
            router.post('/refunds-chargebacks/:id/verify', [controllers.RefundsChargebacks, 'verify'])
            router.post('/refunds-chargebacks/:id/approve', [controllers.RefundsChargebacks, 'approve'])
            router.post('/refunds-chargebacks/:id/reject', [controllers.RefundsChargebacks, 'reject'])
            router.post('/refunds-chargebacks/:id/complete', [controllers.RefundsChargebacks, 'complete'])

            // Fraud analytics (admin & vendor)
            router.get('/fraud/stats', [controllers.FraudAnalytics, 'getStats'])
            router.get('/fraud/flagged', [controllers.FraudAnalytics, 'listFlagged'])
            router.get('/fraud/:id/details', [controllers.FraudAnalytics, 'getFraudDetails'])
            router.post('/fraud/:id/approve-flag', [controllers.FraudAnalytics, 'approveFraudFlag'])
            router.post('/fraud/:id/reject-flag', [controllers.FraudAnalytics, 'rejectFraudFlag'])
            router.post('/fraud/auto-reject-high-risk', [controllers.FraudAnalytics, 'autoRejectHighRisk'])
            router.get('/fraud/trends', [controllers.FraudAnalytics, 'getTrends'])
            router.get('/fraud/top-flags', [controllers.FraudAnalytics, 'getTopFlags'])

            // Analytics dashboard (admin & vendor)
            router.get('/analytics/metrics', [controllers.Analytics, 'getMetrics'])
            router.get('/analytics/summary', [controllers.Analytics, 'getSummary'])
            router.get('/analytics/campaigns', [controllers.Analytics, 'listCampaigns'])
            router.get('/analytics/campaigns/:id', [controllers.Analytics, 'getCampaignMetrics'])
            router.get('/analytics/affiliates', [controllers.Analytics, 'listAffiliates'])
            router.get('/analytics/affiliates/:id', [controllers.Analytics, 'getAffiliateMetrics'])
            router.get('/analytics/commissions', [controllers.Analytics, 'getCommissions'])
            router.get('/analytics/commission-schedule', [controllers.Analytics, 'getCommissionSchedule'])
            router.get('/analytics/export/conversions', [controllers.Analytics, 'exportConversions'])
            router.get('/analytics/export/commissions', [controllers.Analytics, 'exportCommissions'])

            // Influencer profiles (affiliate)
            router.post('/influencers/profile', [controllers.Influencers, 'createProfile'])
            router.get('/influencers/profile', [controllers.Influencers, 'getProfile'])
            router.put('/influencers/profile', [controllers.Influencers, 'updateProfile'])
            router.get('/influencers/stats', [controllers.Influencers, 'getStats'])

            // Collaborations (affiliate)
            router.get('/influencers/collaborations', [controllers.Influencers, 'listCollaborations'])
            router.get('/influencers/collaborations/:id', [controllers.Influencers, 'getCollaboration'])
            router.post('/influencers/collaborations/:id/accept', [controllers.Influencers, 'acceptCollaboration'])

            // Content (affiliate)
            router.post('/influencers/content', [controllers.Influencers, 'createContent'])
            router.get('/influencers/content', [controllers.Influencers, 'listContent'])
            router.get('/influencers/content/:id/analytics', [controllers.Influencers, 'getContentAnalytics'])
            router.get('/influencers/content/performance', [controllers.Influencers, 'getContentPerformance'])
            router.put('/influencers/content/:id', [controllers.Influencers, 'updateContent'])

            // Admin: Influencer management
            router.get('/admin/influencers', [controllers.Influencers, 'listInfluencers'])
            router.get('/admin/influencers/:id', [controllers.Influencers, 'viewInfluencer'])
            router.post('/admin/influencers/:id/verify', [controllers.Influencers, 'verifyInfluencer'])
            router.post('/admin/influencers/:id/reject', [controllers.Influencers, 'rejectInfluencer'])

            // Shopify integration (vendor)
            router.post('/shopify/auth-url', [controllers.Shopify, 'getAuthUrl'])
            router.get('/shopify/store', [controllers.Shopify, 'getStore'])
            router.post('/shopify/disconnect', [controllers.Shopify, 'disconnect'])
            router.post('/shopify/sync/products', [controllers.Shopify, 'syncProducts'])
            router.post('/shopify/sync/orders', [controllers.Shopify, 'syncOrders'])
            router.get('/shopify/products', [controllers.Shopify, 'listProducts'])
            router.put('/shopify/products/:id', [controllers.Shopify, 'updateProduct'])
            router.get('/shopify/orders', [controllers.Shopify, 'listOrders'])
            router.get('/shopify/orders/:id', [controllers.Shopify, 'getOrder'])
            router.post('/shopify/commissions/calculate', [controllers.Shopify, 'calculateCommissions'])
            router.get('/shopify/analytics', [controllers.Shopify, 'getAnalytics'])

            // WooCommerce integration (vendor)
            router.post('/woocommerce/connect', [controllers.Woocommerce, 'connect'])
            router.get('/woocommerce/store', [controllers.Woocommerce, 'getStore'])
            router.post('/woocommerce/disconnect', [controllers.Woocommerce, 'disconnect'])
            router.post('/woocommerce/sync/products', [controllers.Woocommerce, 'syncProducts'])
            router.post('/woocommerce/sync/orders', [controllers.Woocommerce, 'syncOrders'])
            router.get('/woocommerce/products', [controllers.Woocommerce, 'listProducts'])
            router.put('/woocommerce/products/:id', [controllers.Woocommerce, 'updateProduct'])
            router.get('/woocommerce/orders', [controllers.Woocommerce, 'listOrders'])
            router.post('/woocommerce/commissions/calculate', [controllers.Woocommerce, 'calculateCommissions'])
            router.get('/woocommerce/analytics', [controllers.Woocommerce, 'getAnalytics'])

            // Currency and regional pricing (vendor/affiliate)
            router.post('/currencies/format', [controllers.Currency, 'formatAmount'])
            router.get('/products/:id/price/:region', [controllers.Currency, 'getRegionalPrice'])
            router.post('/products/:id/pricing', [controllers.Currency, 'setRegionalPricing'])
            router.get('/products/:id/pricing', [controllers.Currency, 'listProductPricing'])

            // Currency management (admin)
            router.post('/admin/currencies/rates', [controllers.Currency, 'updateExchangeRates'])

            router.put('/users/:id', [controllers.Admin, 'updateUser'])
            router.delete('/users/:id', [controllers.Admin, 'deleteUser'])
            router.post('/reviews/:id/approve', [controllers.Reviews, 'approve'])

            // Payout management
            router.get('/payouts', [controllers.Payouts, 'adminIndex'])
            router.post('/payouts/:id/approve', [controllers.Payouts, 'approve'])
            router.post('/payouts/:id/reject', [controllers.Payouts, 'reject'])
            router.post('/payouts/:id/process', [controllers.Payouts, 'process'])
            router.post('/payouts/:id/complete', [controllers.Payouts, 'complete'])
            router.post('/payouts/:id/fail', [controllers.Payouts, 'fail'])

            // Blog posts
            router.get('/blog-posts', [controllers.BlogPosts, 'index'])
            router.post('/blog-posts', [controllers.BlogPosts, 'store'])
            router.put('/blog-posts/:id', [controllers.BlogPosts, 'update'])
            router.delete('/blog-posts/:id', [controllers.BlogPosts, 'destroy'])

            // Newsletters
            router.get('/newsletters', [controllers.NewsletterAdmin, 'index'])
            router.post('/newsletters', [controllers.NewsletterAdmin, 'store'])
            router.put('/newsletters/:id', [controllers.NewsletterAdmin, 'update'])
            router.delete('/newsletters/:id', [controllers.NewsletterAdmin, 'destroy'])

            // Email campaigns
            router.get('/email-campaigns', [controllers.EmailCampaigns, 'index'])
            router.post('/email-campaigns', [controllers.EmailCampaigns, 'store'])
            router.put('/email-campaigns/:id', [controllers.EmailCampaigns, 'update'])
            router.delete('/email-campaigns/:id', [controllers.EmailCampaigns, 'destroy'])

            // Site settings (hero banner)
            // Static segments before ':key' so they aren't swallowed.
            router.get('/site-settings', [controllers.SiteSettings, 'index'])
            router.post('/site-settings', [controllers.SiteSettings, 'upsert'])
            router.post('/site-settings/upload-image', [controllers.SiteSettings, 'uploadImage'])
            router.get('/site-settings/:key', [controllers.SiteSettings, 'show'])

            // Webhook management (admin)
            router.get('/payments/webhook-endpoints', [controllers.Webhook, 'getWebhookEndpoints'])
            router.post('/payments/webhook-test/:provider', [controllers.Webhook, 'testWebhook'])

            // Payment gateway settings (admin)
            // 'status/list' registered before ':gateway' for the same reason.
            router.get('/payment-gateway-settings', [controllers.PaymentSettings, 'index'])
            router.get('/payment-gateway-settings/status/list', [
              controllers.PaymentSettings,
              'statusList',
            ])
            router.post('/payment-gateway-settings', [controllers.PaymentSettings, 'store'])
            router.get('/payment-gateway-settings/:gateway', [controllers.PaymentSettings, 'show'])
            router.put('/payment-gateway-settings/:gateway', [
              controllers.PaymentSettings,
              'update',
            ])
            router.patch('/payment-gateway-settings/:gateway/toggle', [
              controllers.PaymentSettings,
              'toggle',
            ])
            router.delete('/payment-gateway-settings/:gateway', [
              controllers.PaymentSettings,
              'destroy',
            ])

            // KYC management (admin)
            router.get('/kyc/admin/pending', [controllers.Kyc, 'listPendingSubmissions'])
            router.get('/kyc/admin/statistics', [controllers.Kyc, 'getStatistics'])
            router.get('/kyc/admin/search', [controllers.Kyc, 'searchSubmissions'])
            router.post('/kyc/:submissionId/verify-document/:documentId', [controllers.Kyc, 'verifyDocument'])
            router.post('/kyc/:submissionId/assess-risk', [controllers.Kyc, 'assessRisk'])
            router.post('/kyc/:submissionId/check-compliance', [controllers.Kyc, 'checkCompliance'])
            router.post('/kyc/:submissionId/approve', [controllers.Kyc, 'approveSubmission'])
            router.post('/kyc/:submissionId/reject', [controllers.Kyc, 'rejectSubmission'])

            // Reports management (admin & vendor)
            router.post('/reports', [controllers.Reports, 'createConfiguration'])
            router.get('/reports', [controllers.Reports, 'listConfigurations'])
            router.get('/reports/:id', [controllers.Reports, 'getConfiguration'])
            router.put('/reports/:id', [controllers.Reports, 'updateConfiguration'])
            router.delete('/reports/:id', [controllers.Reports, 'deleteConfiguration'])
            router.post('/reports/:id/generate', [controllers.Reports, 'generateReport'])
            router.get('/reports/:id/logs', [controllers.Reports, 'listReportLogs'])
            router.get('/reports/logs/:id', [controllers.Reports, 'getReportLog'])
            router.get('/reports/logs/:id/download', [controllers.Reports, 'downloadReport'])
            router.post('/reports/:id/schedules', [controllers.Reports, 'createSchedule'])
            router.get('/reports/:id/schedules', [controllers.Reports, 'listSchedules'])
            router.put('/reports/schedules/:scheduleId', [controllers.Reports, 'updateSchedule'])
            router.delete('/reports/schedules/:scheduleId', [controllers.Reports, 'deleteSchedule'])
            router.post('/reports/:id/archive', [controllers.Reports, 'archiveReport'])
            router.get('/reports/stats', [controllers.Reports, 'getStats'])

            // Disputes management (admin)
            router.get('/disputes/open', [controllers.Disputes, 'listOpenDisputes'])
            router.get('/disputes/escalated', [controllers.Disputes, 'listEscalatedDisputes'])
            router.get('/disputes/filter', [controllers.Disputes, 'filterDisputes'])
            router.get('/disputes/stats', [controllers.Disputes, 'getDashboardStats'])
            router.post('/disputes/:id/status', [controllers.Disputes, 'updateStatus'])
            router.post('/disputes/:id/resolve', [controllers.Disputes, 'resolveDispute'])
            router.post('/disputes/:id/assign', [controllers.Disputes, 'assignDispute'])
            router.post('/disputes/:id/escalate', [controllers.Disputes, 'escalateDispute'])
            router.post('/disputes/:id/request-approval', [controllers.Disputes, 'requestApproval'])
            router.post('/disputes/approvals/:approvalId/approve', [controllers.Disputes, 'approveDispute'])
            router.post('/disputes/approvals/:approvalId/reject', [controllers.Disputes, 'rejectDispute'])

            // Affiliate recruitment (admin)
            router.post('/recruitment/campaigns', [controllers.Affiliates, 'createCampaign'])
            router.get('/recruitment/campaigns', [controllers.Affiliates, 'listCampaigns'])
            router.post('/recruitment/campaigns/:id/launch', [controllers.Affiliates, 'launchCampaign'])
            router.post('/recruitment/campaigns/:id/complete', [controllers.Affiliates, 'completeCampaign'])
          })
          .use(middleware.role(['admin']))
          .use(adminThrottle)

        // Disputes endpoints (vendor & affiliate)
        router.post('/disputes', [controllers.Disputes, 'fileDispute'])
        router.get('/disputes', [controllers.Disputes, 'listUserDisputes'])
        router.get('/disputes/:id', [controllers.Disputes, 'getDispute'])
        router.get('/disputes/:id/comments', [controllers.Disputes, 'getComments'])
        router.post('/disputes/:id/comments', [controllers.Disputes, 'addComment'])

        // Affiliate recruitment endpoints (all authenticated users)
        router.post('/affiliate/profile', [controllers.Affiliates, 'createProfile'])
        router.get('/affiliate/profile', [controllers.Affiliates, 'getProfile'])
        router.put('/affiliate/profile', [controllers.Affiliates, 'updateProfile'])
        router.post('/affiliate/referral-codes', [controllers.Affiliates, 'generateReferralCode'])
        router.get('/affiliate/referral-codes', [controllers.Affiliates, 'getReferralCodes'])
        router.get('/affiliate/referral-codes/:id/performance', [controllers.Affiliates, 'getReferralCodePerformance'])
        router.get('/affiliate/referrals', [controllers.Affiliates, 'getReferrals'])
        router.get('/affiliate/rewards', [controllers.Affiliates, 'getRewards'])
        router.post('/affiliate/rewards/:id/claim', [controllers.Affiliates, 'claimReward'])

        // Mobile API endpoints (authenticated)
        router.post('/mobile/devices/register', [controllers.MobileApi, 'registerDevice'])
        router.post('/mobile/token/validate', [controllers.MobileApi, 'validateToken'])

        // Affiliate dashboard (affiliate)
        router.get('/affiliate-dashboard/overview', [controllers.AffiliateDashboard, 'overview'])
        router.get('/affiliate-dashboard/links', [controllers.AffiliateDashboard, 'links'])
        router.get('/affiliate-dashboard/campaigns', [controllers.AffiliateDashboard, 'availableCampaigns'])
        router.get('/affiliate-dashboard/commissions', [controllers.AffiliateDashboard, 'commissions'])
        router.get('/affiliate-dashboard/payouts', [controllers.AffiliateDashboard, 'payouts'])
        router.get('/affiliate-dashboard/earnings', [controllers.AffiliateDashboard, 'earningsBreakdown'])
        router.get('/affiliate-dashboard/trending', [controllers.AffiliateDashboard, 'trending'])
        router.get('/affiliate-dashboard/trends', [controllers.AffiliateDashboard, 'trends'])

        // Vendor dashboard (vendor)
        router.get('/vendor-dashboard/overview', [controllers.VendorDashboard, 'overview'])
        router.get('/vendor-dashboard/campaigns', [controllers.VendorDashboard, 'campaigns'])
        router.get('/vendor-dashboard/affiliates', [controllers.VendorDashboard, 'topAffiliates'])
        router.get('/vendor-dashboard/financials', [controllers.VendorDashboard, 'financials'])
        router.get('/vendor-dashboard/activity', [controllers.VendorDashboard, 'activity'])
        router.get('/vendor-dashboard/campaign/:campaignId', [controllers.VendorDashboard, 'campaignDetails'])
        router.get('/vendor-dashboard/earnings', [controllers.VendorDashboard, 'earningsBreakdown'])
        router.get('/vendor-dashboard/trends', [controllers.VendorDashboard, 'trends'])

        // KYC endpoints (vendor & affiliate)
        router.post('/kyc/submit', [controllers.Kyc, 'createSubmission'])
        router.post('/kyc/:submissionId/documents', [controllers.Kyc, 'uploadDocument'])
        router.get('/kyc/:submissionId', [controllers.Kyc, 'getSubmission'])
        router.get('/kyc/:submissionId/audit-trail', [controllers.Kyc, 'getAuditTrail'])
      })
      .use(middleware.auth())
  })
  .prefix('/api')
