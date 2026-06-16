/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

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

/**
 * Auth routes (guest only)
 */
router
  .group(() => {
    // Sign up flow
    router.get('/signup', [controllers.NewAccount, 'create']).as('register')
    router.post('/signup/step1', [controllers.NewAccount, 'registerStep1'])
    router.post('/signup/step2', [controllers.NewAccount, 'registerStep2'])
    router.post('/signup/step3', [controllers.NewAccount, 'registerStep3'])
    router.post('/signup/verify-otp', [controllers.NewAccount, 'verifyOtp'])
    router.post('/signup/resend-otp', [controllers.NewAccount, 'resendOtp'])

    // Login
    router.get('/login', [controllers.Session, 'create']).as('login')
    router.post('/login', [controllers.NewAccount, 'login'])

    // Password reset
    router.get('/forgot-password', [controllers.Pages, 'forgotPassword']).as('forgot.password')
    router.post('/forgot-password', [controllers.NewAccount, 'forgotPassword'])
    router.get('/reset-password', [controllers.Pages, 'resetPassword']).as('reset.password')
    router.post('/reset-password', [controllers.NewAccount, 'resetPassword'])

    // OAuth routes
    router.get('/google', [controllers.Oauth, 'redirectToGoogle']).as('google.redirect')
    router.get('/google/callback', [controllers.Oauth, 'handleGoogleCallback']).as('google.callback')
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
 * Admin routes
 */
router
  .group(() => {
    router.get('/', [controllers.Pages, 'adminDashboard']).as('admin.dashboard')
    router.get('/users', [controllers.Pages, 'adminUsers']).as('admin.users')
    router.get('/products', [controllers.Pages, 'adminProducts']).as('admin.products')
    router.get('/orders', [controllers.Pages, 'adminOrders']).as('admin.orders')
    router.get('/analytics', [controllers.Pages, 'adminAnalytics']).as('admin.analytics')
  })
  .prefix('/admin')
  .use(middleware.auth(), middleware.role(['admin']))

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
  .use(middleware.auth(), middleware.role(['vendor']))

/**
 * Affiliate routes
 */
router
  .group(() => {
    router.get('/', [controllers.Pages, 'affiliateDashboard']).as('affiliate.dashboard')
    router.get('/products', [controllers.Pages, 'affiliateProducts']).as('affiliate.products')
    router.get('/links', [controllers.Pages, 'affiliateLinks']).as('affiliate.links')
    router.get('/earnings', [controllers.Pages, 'affiliateEarnings']).as('affiliate.earnings')
    router.get('/performance', [controllers.Pages, 'affiliatePerformance']).as('affiliate.performance')
    router.get('/profile', [controllers.Pages, 'affiliateProfile']).as('affiliate.profile')
  })
  .prefix('/affiliate')
  .use(middleware.auth(), middleware.role(['affiliate']))

/**
 * API routes for client-side mutations
 */
router
  .group(() => {
    // Public endpoints
    router.get('/products', [controllers.Products, 'index'])
    router.get('/products/:id', [controllers.Products, 'show'])
    router.post('/newsletters/subscribe', [controllers.Newsletters, 'subscribe'])
    router.post('/newsletters/unsubscribe', [controllers.Newsletters, 'unsubscribe'])
    router.post('/affiliate-links/track-click', [controllers.AffiliateLinks, 'trackClick'])
    router.get('/reviews', [controllers.Reviews, 'index'])

    // Authenticated endpoints
    router
      .group(() => {
        // Products (vendor)
        router.post('/products', [controllers.Products, 'store'])
        router.put('/products/:id', [controllers.Products, 'update'])
        router.delete('/products/:id', [controllers.Products, 'destroy'])

        // Orders
        router.get('/orders', [controllers.Orders, 'index'])
        router.get('/orders/:id', [controllers.Orders, 'show'])
        router.post('/orders', [controllers.Orders, 'processOrder'])

        // Affiliate Links
        router.get('/affiliate-links', [controllers.AffiliateLinks, 'index'])
        router.post('/affiliate-links', [controllers.AffiliateLinks, 'store'])
        router.put('/affiliate-links/:id', [controllers.AffiliateLinks, 'update'])
        router.delete('/affiliate-links/:id', [controllers.AffiliateLinks, 'destroy'])

        // Reviews
        router.post('/reviews', [controllers.Reviews, 'store'])

        // Admin endpoints
        router
          .group(() => {
            router.get('/stats', [controllers.Admin, 'getPlatformStats'])
            router.put('/products/:id/approve', [controllers.Products, 'approve'])
            router.put('/orders/:id', [controllers.Orders, 'updateStatus'])
            router.post('/reviews/:id/approve', [controllers.Reviews, 'approve'])
          })
          .use(middleware.role(['admin']))
      })
      .use(middleware.auth())
  })
  .prefix('/api')
