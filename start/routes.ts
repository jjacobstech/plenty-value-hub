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
    router.post('/newsletters', [controllers.Api, 'subscribeNewsletter'])
    router.post('/reviews', [controllers.Api, 'createReview']).use(middleware.auth())
    router.post('/affiliate-links', [controllers.Api, 'createAffiliateLink']).use(middleware.auth())
    router.post('/affiliate-redirect', [controllers.Api, 'affiliateRedirect'])
    router.post('/orders', [controllers.Api, 'createOrder']).use(middleware.auth())
  })
  .prefix('/api')
