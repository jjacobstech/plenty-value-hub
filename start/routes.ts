/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { authThrottle, signupThrottle, adminThrottle } from '#start/limiter'
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
    router.post('/newsletters/subscribe', [controllers.Newsletters, 'subscribe'])
    router.post('/newsletters/unsubscribe', [controllers.Newsletters, 'unsubscribe'])
    router.post('/affiliate-links/track-click', [controllers.AffiliateLinks, 'trackClick'])
    router.get('/reviews', [controllers.Reviews, 'index'])
    router.get('/payment-settings', [controllers.SiteSettings, 'paymentConfig'])
    router.get('/payment-providers', [controllers.Payment, 'providers'])
    router.post('/payments/initialize', [controllers.Payment, 'initialize'])
    router.post('/payments/verify', [controllers.Payment, 'verify'])

    // ── Webhook endpoints (no auth — secured by signature verification) ──
    // Order matters: AdonisJS matches in registration order, so the named
    // provider routes must come BEFORE the ':provider' catch-all or they
    // will never be reached.
    router.post('/payments/webhook/stripe', [controllers.Webhook, 'stripeWebhook'])
    router.post('/payments/webhook/paystack', [controllers.Webhook, 'paystackWebhook'])
    router.post('/payments/webhook/flutterwave', [controllers.Webhook, 'flutterwaveWebhook'])
    router.post('/payments/webhook/paypal', [controllers.Webhook, 'paypalWebhook'])
    router.post('/payments/webhook/:provider', [controllers.Webhook, 'handleWebhook'])

    // ── Authenticated endpoints ───────────────────────────────────────
    router
      .group(() => {
        // Products (vendor)
        router.post('/products', [controllers.Products, 'store'])
        router.put('/products/:id', [controllers.Products, 'update'])
        router.delete('/products/:id', [controllers.Products, 'destroy'])

        // Payments

        // Orders
        router.get('/orders', [controllers.Orders, 'index'])
        router.get('/orders/:id', [controllers.Orders, 'show'])
        router.post('/orders', [controllers.Orders, 'processOrder'])
        router.post('/orders/:id/notify-vendor', [controllers.Orders, 'notifyVendor'])

        // Affiliate Links
        router.get('/affiliate-links', [controllers.AffiliateLinks, 'index'])
        router.post('/affiliate-links', [controllers.AffiliateLinks, 'store'])
        router.put('/affiliate-links/:id', [controllers.AffiliateLinks, 'update'])
        router.delete('/affiliate-links/:id', [controllers.AffiliateLinks, 'destroy'])

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
        router.get('/wallet', [controllers.Wallet, 'show'])
        router.post('/wallet/payouts', [controllers.Wallet, 'requestPayout'])

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
            router.get('/stats', [controllers.Admin, 'getPlatformStats'])
            router.get('/auth-status', [controllers.Admin, 'authStatus'])
            router.put('/products/:id/approve', [controllers.Products, 'approve'])
            router.put('/orders/:id', [controllers.Orders, 'updateStatus'])
            router.put('/users/:id', [controllers.Admin, 'updateUser'])
            router.post('/reviews/:id/approve', [controllers.Reviews, 'approve'])

            // Payout management
            router.get('/payouts', [controllers.Wallet, 'adminIndex'])
            router.put('/payouts/:id', [controllers.Wallet, 'adminUpdate'])

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
          })
          .use(middleware.role(['admin']))
          .use(adminThrottle)
      })
      .use(middleware.auth())
  })
  .prefix('/api')
