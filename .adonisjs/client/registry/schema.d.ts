/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'drive.fs.serve': {
    methods: ["GET","HEAD"]
    pattern: '/uploads/*'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { '*': ParamValue[] }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'seo.sitemap': {
    methods: ["GET","HEAD"]
    pattern: '/sitemap.xml'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/seo_controller').default['sitemap']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/seo_controller').default['sitemap']>>>
    }
  }
  'seo.robots': {
    methods: ["GET","HEAD"]
    pattern: '/robots.txt'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/seo_controller').default['robots']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/seo_controller').default['robots']>>>
    }
  }
  'home': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['home']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['home']>>>
    }
  }
  'marketplace': {
    methods: ["GET","HEAD"]
    pattern: '/marketplace'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['marketplace']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['marketplace']>>>
    }
  }
  'reviews': {
    methods: ["GET","HEAD"]
    pattern: '/reviews'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['reviews']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['reviews']>>>
    }
  }
  'product.detail': {
    methods: ["GET","HEAD"]
    pattern: '/product/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['productDetail']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['productDetail']>>>
    }
  }
  'affiliate.redirect': {
    methods: ["GET","HEAD"]
    pattern: '/ref/:link_code'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { link_code: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['affiliateRedirect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['affiliateRedirect']>>>
    }
  }
  'for.partners': {
    methods: ["GET","HEAD"]
    pattern: '/for-partners'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['forPartners']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['forPartners']>>>
    }
  }
  'privacy': {
    methods: ["GET","HEAD"]
    pattern: '/privacy'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['privacyPolicy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['privacyPolicy']>>>
    }
  }
  'track.order': {
    methods: ["GET","HEAD"]
    pattern: '/track-order'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['trackOrder']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['trackOrder']>>>
    }
  }
  'legacy.login': {
    methods: ["GET","HEAD"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
    }
  }
  'legacy.register': {
    methods: ["GET","HEAD"]
    pattern: '/register'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['create']>>>
    }
  }
  'legacy.forgot.password': {
    methods: ["GET","HEAD"]
    pattern: '/forgot-password'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['forgotPassword']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['forgotPassword']>>>
    }
  }
  'legacy.reset.password': {
    methods: ["GET","HEAD"]
    pattern: '/reset-password'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['resetPassword']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['resetPassword']>>>
    }
  }
  'legacy.verify.email': {
    methods: ["GET","HEAD"]
    pattern: '/verify-email'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['verifyEmail']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['verifyEmail']>>>
    }
  }
  'register': {
    methods: ["GET","HEAD"]
    pattern: '/auth/signup'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['create']>>>
    }
  }
  'new_account.store': {
    methods: ["POST"]
    pattern: '/auth/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'new_account.register_step_1': {
    methods: ["POST"]
    pattern: '/auth/signup/step1'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').registerStep1Validator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').registerStep1Validator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['registerStep1']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['registerStep1']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'new_account.register_step_2': {
    methods: ["POST"]
    pattern: '/auth/signup/step2'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').registerStep2Validator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').registerStep2Validator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['registerStep2']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['registerStep2']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'new_account.register_step_3': {
    methods: ["POST"]
    pattern: '/auth/signup/step3'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').registerStep3Validator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').registerStep3Validator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['registerStep3']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['registerStep3']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'new_account.verify_otp': {
    methods: ["POST"]
    pattern: '/auth/signup/verify-otp'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').verifyOtpValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').verifyOtpValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['verifyOtp']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['verifyOtp']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'new_account.resend_otp': {
    methods: ["POST"]
    pattern: '/auth/signup/resend-otp'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['resendOtp']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['resendOtp']>>>
    }
  }
  'login': {
    methods: ["GET","HEAD"]
    pattern: '/auth/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
    }
  }
  'new_account.login': {
    methods: ["POST"]
    pattern: '/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['login']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['login']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'verify.email': {
    methods: ["GET","HEAD"]
    pattern: '/auth/verify-email'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['verifyEmail']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['verifyEmail']>>>
    }
  }
  'forgot.password': {
    methods: ["GET","HEAD"]
    pattern: '/auth/forgot-password'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['forgotPassword']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['forgotPassword']>>>
    }
  }
  'new_account.forgot_password': {
    methods: ["POST"]
    pattern: '/auth/forgot-password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').forgotPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').forgotPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['forgotPassword']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['forgotPassword']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'reset.password': {
    methods: ["GET","HEAD"]
    pattern: '/auth/reset-password'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['resetPassword']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['resetPassword']>>>
    }
  }
  'new_account.reset_password': {
    methods: ["POST"]
    pattern: '/auth/reset-password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').resetPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').resetPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['resetPassword']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['resetPassword']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'google.redirect': {
    methods: ["GET","HEAD"]
    pattern: '/auth/google'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/oauth_controller').default['redirectToGoogle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/oauth_controller').default['redirectToGoogle']>>>
    }
  }
  'google.callback': {
    methods: ["GET","HEAD"]
    pattern: '/auth/google/callback'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/oauth_controller').default['handleGoogleCallback']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/oauth_controller').default['handleGoogleCallback']>>>
    }
  }
  'logout': {
    methods: ["POST"]
    pattern: '/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
    }
  }
  'admin.auth.login': {
    methods: ["GET","HEAD"]
    pattern: '/admin/auth/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_auth_controller').default['loginPage']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_auth_controller').default['loginPage']>>>
    }
  }
  'admin.auth.setup.google': {
    methods: ["GET","HEAD"]
    pattern: '/admin/auth/setup/google'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_auth_controller').default['redirectToGoogleSetup']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_auth_controller').default['redirectToGoogleSetup']>>>
    }
  }
  'admin.auth.login.google': {
    methods: ["GET","HEAD"]
    pattern: '/admin/auth/login/google'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_auth_controller').default['redirectToGoogleLogin']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_auth_controller').default['redirectToGoogleLogin']>>>
    }
  }
  'admin.auth.callback': {
    methods: ["GET","HEAD"]
    pattern: '/admin/auth/google/callback'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_auth_controller').default['handleGoogleCallback']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_auth_controller').default['handleGoogleCallback']>>>
    }
  }
  'admin.dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/admin'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminDashboard']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminDashboard']>>>
    }
  }
  'admin.users': {
    methods: ["GET","HEAD"]
    pattern: '/admin/users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminUsers']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminUsers']>>>
    }
  }
  'admin.products': {
    methods: ["GET","HEAD"]
    pattern: '/admin/products'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminProducts']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminProducts']>>>
    }
  }
  'admin.orders': {
    methods: ["GET","HEAD"]
    pattern: '/admin/orders'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminOrders']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminOrders']>>>
    }
  }
  'admin.analytics': {
    methods: ["GET","HEAD"]
    pattern: '/admin/analytics'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminAnalytics']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminAnalytics']>>>
    }
  }
  'admin.subscribers': {
    methods: ["GET","HEAD"]
    pattern: '/admin/subscribers'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminSubscribers']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminSubscribers']>>>
    }
  }
  'admin.blog': {
    methods: ["GET","HEAD"]
    pattern: '/admin/blog'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminBlog']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminBlog']>>>
    }
  }
  'admin.newsletters': {
    methods: ["GET","HEAD"]
    pattern: '/admin/newsletters'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminNewsletterList']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminNewsletterList']>>>
    }
  }
  'admin.newsletter': {
    methods: ["GET","HEAD"]
    pattern: '/admin/newsletter'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminNewsletter']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminNewsletter']>>>
    }
  }
  'admin.email.campaigns': {
    methods: ["GET","HEAD"]
    pattern: '/admin/email-campaigns'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminEmailCampaigns']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminEmailCampaigns']>>>
    }
  }
  'admin.conversions': {
    methods: ["GET","HEAD"]
    pattern: '/admin/conversions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminConversions']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminConversions']>>>
    }
  }
  'admin.hero.banner': {
    methods: ["GET","HEAD"]
    pattern: '/admin/hero-banner'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminHeroBanner']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminHeroBanner']>>>
    }
  }
  'admin.payment.settings': {
    methods: ["GET","HEAD"]
    pattern: '/admin/payment-settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminPaymentSettings']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminPaymentSettings']>>>
    }
  }
  'admin.payouts': {
    methods: ["GET","HEAD"]
    pattern: '/admin/payouts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminPayouts']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminPayouts']>>>
    }
  }
  'admin.disputes': {
    methods: ["GET","HEAD"]
    pattern: '/admin/disputes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminDisputes']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminDisputes']>>>
    }
  }
  'admin.fraud': {
    methods: ["GET","HEAD"]
    pattern: '/admin/fraud-detection'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminFraudDetection']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['adminFraudDetection']>>>
    }
  }
  'vendor.dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/vendor'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['vendorDashboard']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['vendorDashboard']>>>
    }
  }
  'vendor.products': {
    methods: ["GET","HEAD"]
    pattern: '/vendor/products'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['vendorProducts']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['vendorProducts']>>>
    }
  }
  'vendor.orders': {
    methods: ["GET","HEAD"]
    pattern: '/vendor/orders'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['vendorOrders']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['vendorOrders']>>>
    }
  }
  'vendor.kyc': {
    methods: ["GET","HEAD"]
    pattern: '/vendor/kyc'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['vendorKYC']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['vendorKYC']>>>
    }
  }
  'vendor.earnings': {
    methods: ["GET","HEAD"]
    pattern: '/vendor/earnings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['vendorEarnings']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['vendorEarnings']>>>
    }
  }
  'vendor.analytics': {
    methods: ["GET","HEAD"]
    pattern: '/vendor/analytics'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['vendorAnalytics']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['vendorAnalytics']>>>
    }
  }
  'vendor.profile': {
    methods: ["GET","HEAD"]
    pattern: '/vendor/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['vendorProfile']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['vendorProfile']>>>
    }
  }
  'vendor.integrations': {
    methods: ["GET","HEAD"]
    pattern: '/vendor/integrations'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['vendorIntegrations']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['vendorIntegrations']>>>
    }
  }
  'affiliate.dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/affiliate'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['affiliateDashboard']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['affiliateDashboard']>>>
    }
  }
  'affiliate.products': {
    methods: ["GET","HEAD"]
    pattern: '/affiliate/products'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['affiliateProducts']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['affiliateProducts']>>>
    }
  }
  'affiliate.campaigns.discover': {
    methods: ["GET","HEAD"]
    pattern: '/affiliate/campaigns/discover'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['campaignDiscovery']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['campaignDiscovery']>>>
    }
  }
  'affiliate.links': {
    methods: ["GET","HEAD"]
    pattern: '/affiliate/links'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['affiliateLinks']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['affiliateLinks']>>>
    }
  }
  'affiliate.earnings': {
    methods: ["GET","HEAD"]
    pattern: '/affiliate/earnings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['affiliateEarnings']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['affiliateEarnings']>>>
    }
  }
  'affiliate.performance': {
    methods: ["GET","HEAD"]
    pattern: '/affiliate/performance'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['affiliatePerformance']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['affiliatePerformance']>>>
    }
  }
  'affiliate.profile': {
    methods: ["GET","HEAD"]
    pattern: '/affiliate/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['affiliateProfile']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['affiliateProfile']>>>
    }
  }
  'products.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/products'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/products_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/products_controller').default['index']>>>
    }
  }
  'products.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/products/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/products_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/products_controller').default['show']>>>
    }
  }
  'campaigns.discover': {
    methods: ["GET","HEAD"]
    pattern: '/api/campaigns'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['discover']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['discover']>>>
    }
  }
  'campaigns.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/campaigns/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['show']>>>
    }
  }
  'shopify.handle_callback': {
    methods: ["GET","HEAD"]
    pattern: '/api/shopify/callback'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/shopify_controller').default['handleCallback']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/shopify_controller').default['handleCallback']>>>
    }
  }
  'purchase_destinations.handle_redirect': {
    methods: ["GET","HEAD"]
    pattern: '/api/purchase-destinations/:token/redirect'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/purchase_destinations_controller').default['handleRedirect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/purchase_destinations_controller').default['handleRedirect']>>>
    }
  }
  'newsletters.subscribe': {
    methods: ["POST"]
    pattern: '/api/newsletters/subscribe'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/newsletter').subscribeNewsletterValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/newsletter').subscribeNewsletterValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/newsletters_controller').default['subscribe']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/newsletters_controller').default['subscribe']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'newsletters.unsubscribe': {
    methods: ["POST"]
    pattern: '/api/newsletters/unsubscribe'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/newsletter').unsubscribeValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/newsletter').unsubscribeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/newsletters_controller').default['unsubscribe']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/newsletters_controller').default['unsubscribe']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'affiliate_links.track_click': {
    methods: ["POST"]
    pattern: '/api/affiliate-links/track-click'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliate_links_controller').default['trackClick']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliate_links_controller').default['trackClick']>>>
    }
  }
  'reviews.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/reviews'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reviews_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reviews_controller').default['index']>>>
    }
  }
  'currency.list_currencies': {
    methods: ["GET","HEAD"]
    pattern: '/api/currencies'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/currency_controller').default['listCurrencies']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/currency_controller').default['listCurrencies']>>>
    }
  }
  'currency.get_currency': {
    methods: ["GET","HEAD"]
    pattern: '/api/currencies/:code'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { code: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/currency_controller').default['getCurrency']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/currency_controller').default['getCurrency']>>>
    }
  }
  'currency.convert_currency': {
    methods: ["POST"]
    pattern: '/api/currencies/convert'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/currency_controller').default['convertCurrency']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/currency_controller').default['convertCurrency']>>>
    }
  }
  'currency.get_supported_regions': {
    methods: ["GET","HEAD"]
    pattern: '/api/currencies/:code/regions'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { code: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/currency_controller').default['getSupportedRegions']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/currency_controller').default['getSupportedRegions']>>>
    }
  }
  'currency.get_exchange_rate_history': {
    methods: ["GET","HEAD"]
    pattern: '/api/currencies/rates/:from/:to'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { from: ParamValue; to: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/currency_controller').default['getExchangeRateHistory']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/currency_controller').default['getExchangeRateHistory']>>>
    }
  }
  'site_settings.payment_config': {
    methods: ["GET","HEAD"]
    pattern: '/api/payment-settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/site_settings_controller').default['paymentConfig']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/site_settings_controller').default['paymentConfig']>>>
    }
  }
  'payment.providers': {
    methods: ["GET","HEAD"]
    pattern: '/api/payment-providers'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payment_controller').default['providers']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payment_controller').default['providers']>>>
    }
  }
  'payment.initialize': {
    methods: ["POST"]
    pattern: '/api/payments/initialize'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/payment').initializePaymentValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/payment').initializePaymentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payment_controller').default['initialize']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payment_controller').default['initialize']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'payment.verify': {
    methods: ["POST"]
    pattern: '/api/payments/verify'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/payment').verifyPaymentValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/payment').verifyPaymentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payment_controller').default['verify']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payment_controller').default['verify']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'orders.track_order': {
    methods: ["POST"]
    pattern: '/api/orders/track'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['trackOrder']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['trackOrder']>>>
    }
  }
  'orders.download_digital_asset': {
    methods: ["GET","HEAD"]
    pattern: '/api/orders/download'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['downloadDigitalAsset']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['downloadDigitalAsset']>>>
    }
  }
  'affiliates.get_top_performers': {
    methods: ["GET","HEAD"]
    pattern: '/api/affiliates/top-performers'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['getTopPerformers']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['getTopPerformers']>>>
    }
  }
  'affiliates.get_affiliates_by_tier': {
    methods: ["GET","HEAD"]
    pattern: '/api/affiliates/tier/:tier'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { tier: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['getAffiliatesByTier']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['getAffiliatesByTier']>>>
    }
  }
  'mobile_api.get_app_config': {
    methods: ["GET","HEAD"]
    pattern: '/api/mobile/config'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/mobile_api_controller').default['getAppConfig']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/mobile_api_controller').default['getAppConfig']>>>
    }
  }
  'mobile_api.get_device_info': {
    methods: ["GET","HEAD"]
    pattern: '/api/mobile/device-info'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/mobile_api_controller').default['getDeviceInfo']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/mobile_api_controller').default['getDeviceInfo']>>>
    }
  }
  'mobile_api.health_check': {
    methods: ["GET","HEAD"]
    pattern: '/api/mobile/health'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/mobile_api_controller').default['healthCheck']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/mobile_api_controller').default['healthCheck']>>>
    }
  }
  'mobile_api.get_help': {
    methods: ["GET","HEAD"]
    pattern: '/api/mobile/help'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/mobile_api_controller').default['getHelp']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/mobile_api_controller').default['getHelp']>>>
    }
  }
  'mobile_api.report_error': {
    methods: ["POST"]
    pattern: '/api/mobile/errors/report'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/mobile_api_controller').default['reportError']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/mobile_api_controller').default['reportError']>>>
    }
  }
  'webhook.stripe_webhook': {
    methods: ["POST"]
    pattern: '/api/payments/webhook/stripe'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/webhook_controller').default['stripeWebhook']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/webhook_controller').default['stripeWebhook']>>>
    }
  }
  'webhook.paystack_webhook': {
    methods: ["POST"]
    pattern: '/api/payments/webhook/paystack'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/webhook_controller').default['paystackWebhook']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/webhook_controller').default['paystackWebhook']>>>
    }
  }
  'webhook.flutterwave_webhook': {
    methods: ["POST"]
    pattern: '/api/payments/webhook/flutterwave'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/webhook_controller').default['flutterwaveWebhook']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/webhook_controller').default['flutterwaveWebhook']>>>
    }
  }
  'webhook.paypal_webhook': {
    methods: ["POST"]
    pattern: '/api/payments/webhook/paypal'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/webhook_controller').default['paypalWebhook']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/webhook_controller').default['paypalWebhook']>>>
    }
  }
  'webhook.handle_webhook': {
    methods: ["POST"]
    pattern: '/api/payments/webhook/:provider'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { provider: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/webhook_controller').default['handleWebhook']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/webhook_controller').default['handleWebhook']>>>
    }
  }
  'products.store': {
    methods: ["POST"]
    pattern: '/api/products'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/product').createProductValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/product').createProductValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/products_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/products_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'products.update': {
    methods: ["PUT"]
    pattern: '/api/products/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/product').updateProductValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/product').updateProductValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/products_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/products_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'products.destroy': {
    methods: ["DELETE"]
    pattern: '/api/products/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/products_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/products_controller').default['destroy']>>>
    }
  }
  'campaigns.create': {
    methods: ["POST"]
    pattern: '/api/campaigns'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['create']>>>
    }
  }
  'campaigns.update': {
    methods: ["PUT"]
    pattern: '/api/campaigns/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['update']>>>
    }
  }
  'campaigns.submit': {
    methods: ["POST"]
    pattern: '/api/campaigns/:id/submit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['submit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['submit']>>>
    }
  }
  'campaigns.pause': {
    methods: ["POST"]
    pattern: '/api/campaigns/:id/pause'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['pause']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['pause']>>>
    }
  }
  'campaigns.resume': {
    methods: ["POST"]
    pattern: '/api/campaigns/:id/resume'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['resume']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['resume']>>>
    }
  }
  'campaigns.vendor_campaigns': {
    methods: ["GET","HEAD"]
    pattern: '/api/campaigns/vendor'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['vendorCampaigns']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['vendorCampaigns']>>>
    }
  }
  'campaigns.join': {
    methods: ["POST"]
    pattern: '/api/campaigns/:id/join'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['join']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['join']>>>
    }
  }
  'campaigns.affiliate_campaigns': {
    methods: ["GET","HEAD"]
    pattern: '/api/affiliate-campaigns'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['affiliateCampaigns']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['affiliateCampaigns']>>>
    }
  }
  'purchase_destinations.configure_campaign_destination': {
    methods: ["PUT"]
    pattern: '/api/campaigns/:campaignId/purchase-destination'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { campaignId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/purchase_destinations_controller').default['configureCampaignDestination']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/purchase_destinations_controller').default['configureCampaignDestination']>>>
    }
  }
  'purchase_destinations.generate_redirect_link': {
    methods: ["POST"]
    pattern: '/api/campaigns/:campaignId/purchase-destination-link'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { campaignId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/purchase_destinations_controller').default['generateRedirectLink']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/purchase_destinations_controller').default['generateRedirectLink']>>>
    }
  }
  'purchase_destinations.get_stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/campaigns/:campaignId/purchase-destination-stats'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { campaignId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/purchase_destinations_controller').default['getStats']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/purchase_destinations_controller').default['getStats']>>>
    }
  }
  'purchase_destinations.record_conversion': {
    methods: ["POST"]
    pattern: '/api/campaigns/:campaignId/report-conversion'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { campaignId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/purchase_destinations_controller').default['recordConversion']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/purchase_destinations_controller').default['recordConversion']>>>
    }
  }
  'vendor_conversions.report_conversion': {
    methods: ["POST"]
    pattern: '/api/campaigns/:campaignId/conversions'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { campaignId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/vendor_conversions_controller').default['reportConversion']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/vendor_conversions_controller').default['reportConversion']>>>
    }
  }
  'vendor_conversions.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/campaigns/:campaignId/conversions'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { campaignId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/vendor_conversions_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/vendor_conversions_controller').default['index']>>>
    }
  }
  'vendor_conversions.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/conversions/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/vendor_conversions_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/vendor_conversions_controller').default['show']>>>
    }
  }
  'vendor_conversions.dispute': {
    methods: ["POST"]
    pattern: '/api/conversions/:id/dispute'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/vendor_conversions_controller').default['dispute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/vendor_conversions_controller').default['dispute']>>>
    }
  }
  'vendor_conversions.get_stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/campaigns/:campaignId/conversions/stats'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { campaignId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/vendor_conversions_controller').default['getStats']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/vendor_conversions_controller').default['getStats']>>>
    }
  }
  'commission_ledger.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/commissions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/commission_ledger_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/commission_ledger_controller').default['index']>>>
    }
  }
  'commission_ledger.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/commissions/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/commission_ledger_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/commission_ledger_controller').default['show']>>>
    }
  }
  'commission_ledger.dispute': {
    methods: ["POST"]
    pattern: '/api/commissions/:id/dispute'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/commission_ledger_controller').default['dispute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/commission_ledger_controller').default['dispute']>>>
    }
  }
  'commission_ledger.get_stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/commissions/stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/commission_ledger_controller').default['getStats']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/commission_ledger_controller').default['getStats']>>>
    }
  }
  'commission_ledger.campaign_stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/commissions/campaign/:campaignId/stats'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { campaignId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/commission_ledger_controller').default['campaignStats']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/commission_ledger_controller').default['campaignStats']>>>
    }
  }
  'refunds_chargebacks.report': {
    methods: ["POST"]
    pattern: '/api/refunds-chargebacks/report'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/refunds_chargebacks_controller').default['report']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/refunds_chargebacks_controller').default['report']>>>
    }
  }
  'refunds_chargebacks.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/refunds-chargebacks'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/refunds_chargebacks_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/refunds_chargebacks_controller').default['index']>>>
    }
  }
  'refunds_chargebacks.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/refunds-chargebacks/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/refunds_chargebacks_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/refunds_chargebacks_controller').default['show']>>>
    }
  }
  'refunds_chargebacks.get_stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/refunds-chargebacks/stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/refunds_chargebacks_controller').default['getStats']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/refunds_chargebacks_controller').default['getStats']>>>
    }
  }
  'orders.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/orders'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['index']>>>
    }
  }
  'orders.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/orders/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['show']>>>
    }
  }
  'orders.process_order': {
    methods: ["POST"]
    pattern: '/api/orders'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/order').processOrderValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/order').processOrderValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['processOrder']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['processOrder']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'vendor.orders.update': {
    methods: ["PUT"]
    pattern: '/api/orders/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/order').updateOrderValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/order').updateOrderValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['updateStatus']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['updateStatus']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'orders.notify_vendor': {
    methods: ["POST"]
    pattern: '/api/orders/:id/notify-vendor'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['notifyVendor']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['notifyVendor']>>>
    }
  }
  'affiliate_links.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/affiliate-links'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliate_links_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliate_links_controller').default['index']>>>
    }
  }
  'affiliate_links.create': {
    methods: ["POST"]
    pattern: '/api/affiliate-links'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliate_links_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliate_links_controller').default['create']>>>
    }
  }
  'affiliate_links.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/affiliate-links/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliate_links_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliate_links_controller').default['show']>>>
    }
  }
  'affiliate_links.update': {
    methods: ["PUT"]
    pattern: '/api/affiliate-links/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliate_links_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliate_links_controller').default['update']>>>
    }
  }
  'affiliate_links.destroy': {
    methods: ["DELETE"]
    pattern: '/api/affiliate-links/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliate_links_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliate_links_controller').default['destroy']>>>
    }
  }
  'affiliate_links.metrics': {
    methods: ["GET","HEAD"]
    pattern: '/api/affiliate-links/:id/metrics'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliate_links_controller').default['metrics']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliate_links_controller').default['metrics']>>>
    }
  }
  'affiliate_links.conversions': {
    methods: ["GET","HEAD"]
    pattern: '/api/affiliate-links/:id/conversions'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliate_links_controller').default['conversions']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliate_links_controller').default['conversions']>>>
    }
  }
  'affiliate_links.track_click_slug': {
    methods: ["POST"]
    pattern: '/api/clicks/track/:slug'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliate_links_controller').default['trackClick']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliate_links_controller').default['trackClick']>>>
    }
  }
  'affiliate_links.report_conversion': {
    methods: ["POST"]
    pattern: '/api/conversions/report'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliate_links_controller').default['reportConversion']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliate_links_controller').default['reportConversion']>>>
    }
  }
  'reviews.store': {
    methods: ["POST"]
    pattern: '/api/reviews'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/review').createReviewValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/review').createReviewValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reviews_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reviews_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'profile.update_affiliate': {
    methods: ["PUT"]
    pattern: '/api/profile/affiliate'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['updateAffiliate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['updateAffiliate']>>>
    }
  }
  'profile.update_vendor': {
    methods: ["PUT"]
    pattern: '/api/profile/vendor'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['updateVendor']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['updateVendor']>>>
    }
  }
  'profile.upload_image': {
    methods: ["POST"]
    pattern: '/api/profile/upload-image'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['uploadImage']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['uploadImage']>>>
    }
  }
  'upload.upload_product_image': {
    methods: ["POST"]
    pattern: '/api/uploads/product-image'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/upload_controller').default['uploadProductImage']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/upload_controller').default['uploadProductImage']>>>
    }
  }
  'upload.upload_product_gallery': {
    methods: ["POST"]
    pattern: '/api/uploads/product-gallery'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/upload_controller').default['uploadProductGallery']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/upload_controller').default['uploadProductGallery']>>>
    }
  }
  'upload.upload_digital_asset': {
    methods: ["POST"]
    pattern: '/api/uploads/digital-asset'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/upload_controller').default['uploadDigitalAsset']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/upload_controller').default['uploadDigitalAsset']>>>
    }
  }
  'upload.upload_profile_image': {
    methods: ["POST"]
    pattern: '/api/uploads/profile-image'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/upload_controller').default['uploadProfileImage']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/upload_controller').default['uploadProfileImage']>>>
    }
  }
  'upload.upload_admin_image': {
    methods: ["POST"]
    pattern: '/api/uploads/admin-image'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/upload_controller').default['uploadAdminImage']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/upload_controller').default['uploadAdminImage']>>>
    }
  }
  'upload.upload_video': {
    methods: ["POST"]
    pattern: '/api/uploads/video'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/upload_controller').default['uploadVideo']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/upload_controller').default['uploadVideo']>>>
    }
  }
  'upload.upload_document': {
    methods: ["POST"]
    pattern: '/api/uploads/document'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/upload_controller').default['uploadDocument']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/upload_controller').default['uploadDocument']>>>
    }
  }
  'upload.upload_file': {
    methods: ["POST"]
    pattern: '/api/uploads/file'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/upload_controller').default['uploadFile']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/upload_controller').default['uploadFile']>>>
    }
  }
  'payouts.wallet': {
    methods: ["GET","HEAD"]
    pattern: '/api/wallet'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payouts_controller').default['wallet']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payouts_controller').default['wallet']>>>
    }
  }
  'payouts.request_payout': {
    methods: ["POST"]
    pattern: '/api/payouts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payouts_controller').default['requestPayout']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payouts_controller').default['requestPayout']>>>
    }
  }
  'payouts.history': {
    methods: ["GET","HEAD"]
    pattern: '/api/payouts/history'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payouts_controller').default['history']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payouts_controller').default['history']>>>
    }
  }
  'payouts.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/payouts/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payouts_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payouts_controller').default['show']>>>
    }
  }
  'payouts.add_payment_method': {
    methods: ["POST"]
    pattern: '/api/payment-methods'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payouts_controller').default['addPaymentMethod']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payouts_controller').default['addPaymentMethod']>>>
    }
  }
  'payouts.payment_methods': {
    methods: ["GET","HEAD"]
    pattern: '/api/payment-methods'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payouts_controller').default['paymentMethods']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payouts_controller').default['paymentMethods']>>>
    }
  }
  'notifications.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/notifications'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['index']>>>
    }
  }
  'notifications.get_unread_count': {
    methods: ["GET","HEAD"]
    pattern: '/api/notifications/unread'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['getUnreadCount']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['getUnreadCount']>>>
    }
  }
  'notifications.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/notifications/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['show']>>>
    }
  }
  'notifications.mark_as_read': {
    methods: ["PATCH"]
    pattern: '/api/notifications/:id/read'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['markAsRead']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['markAsRead']>>>
    }
  }
  'notifications.mark_all_as_read': {
    methods: ["PATCH"]
    pattern: '/api/notifications/read-all'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['markAllAsRead']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['markAllAsRead']>>>
    }
  }
  'notifications.destroy': {
    methods: ["DELETE"]
    pattern: '/api/notifications/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['destroy']>>>
    }
  }
  'notifications.destroy_all': {
    methods: ["DELETE"]
    pattern: '/api/notifications'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['destroyAll']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['destroyAll']>>>
    }
  }
  'admin_dashboard.overview': {
    methods: ["GET","HEAD"]
    pattern: '/api/dashboard/overview'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_dashboard_controller').default['overview']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_dashboard_controller').default['overview']>>>
    }
  }
  'admin_dashboard.pending_campaigns': {
    methods: ["GET","HEAD"]
    pattern: '/api/dashboard/pending-campaigns'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_dashboard_controller').default['pendingCampaigns']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_dashboard_controller').default['pendingCampaigns']>>>
    }
  }
  'admin_dashboard.recent_conversions': {
    methods: ["GET","HEAD"]
    pattern: '/api/dashboard/recent-conversions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_dashboard_controller').default['recentConversions']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_dashboard_controller').default['recentConversions']>>>
    }
  }
  'admin_dashboard.users': {
    methods: ["GET","HEAD"]
    pattern: '/api/dashboard/users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_dashboard_controller').default['users']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_dashboard_controller').default['users']>>>
    }
  }
  'admin_dashboard.commission_stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/dashboard/commissions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_dashboard_controller').default['commissionStats']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_dashboard_controller').default['commissionStats']>>>
    }
  }
  'admin_dashboard.payout_stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/dashboard/payouts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_dashboard_controller').default['payoutStats']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_dashboard_controller').default['payoutStats']>>>
    }
  }
  'admin_dashboard.top_campaigns': {
    methods: ["GET","HEAD"]
    pattern: '/api/dashboard/campaigns'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_dashboard_controller').default['topCampaigns']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_dashboard_controller').default['topCampaigns']>>>
    }
  }
  'admin_dashboard.top_affiliates': {
    methods: ["GET","HEAD"]
    pattern: '/api/dashboard/affiliates'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_dashboard_controller').default['topAffiliates']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_dashboard_controller').default['topAffiliates']>>>
    }
  }
  'admin_dashboard.financial_overview': {
    methods: ["GET","HEAD"]
    pattern: '/api/dashboard/financial'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_dashboard_controller').default['financialOverview']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_dashboard_controller').default['financialOverview']>>>
    }
  }
  'admin_dashboard.system_health': {
    methods: ["GET","HEAD"]
    pattern: '/api/dashboard/health'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_dashboard_controller').default['systemHealth']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_dashboard_controller').default['systemHealth']>>>
    }
  }
  'admin_dashboard.platform_activity': {
    methods: ["GET","HEAD"]
    pattern: '/api/dashboard/activity'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_dashboard_controller').default['platformActivity']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_dashboard_controller').default['platformActivity']>>>
    }
  }
  'admin.get_platform_stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_controller').default['getPlatformStats']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_controller').default['getPlatformStats']>>>
    }
  }
  'admin.auth_status': {
    methods: ["GET","HEAD"]
    pattern: '/api/auth-status'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_controller').default['authStatus']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_controller').default['authStatus']>>>
    }
  }
  'admin.debug_paystack_banks': {
    methods: ["GET","HEAD"]
    pattern: '/api/debug/banks'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_controller').default['debugPaystackBanks']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_controller').default['debugPaystackBanks']>>>
    }
  }
  'admin.test_email': {
    methods: ["POST"]
    pattern: '/api/debug/test-email'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_controller').default['testEmail']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_controller').default['testEmail']>>>
    }
  }
  'products.approve': {
    methods: ["PUT"]
    pattern: '/api/products/:id/approve'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/products_controller').default['approve']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/products_controller').default['approve']>>>
    }
  }
  'campaigns.approve': {
    methods: ["POST"]
    pattern: '/api/campaigns/:id/approve'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['approve']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['approve']>>>
    }
  }
  'campaigns.reject': {
    methods: ["POST"]
    pattern: '/api/campaigns/:id/reject'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['reject']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['reject']>>>
    }
  }
  'vendor_conversions.approve': {
    methods: ["PUT"]
    pattern: '/api/conversions/:id/approve'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/vendor_conversions_controller').default['approve']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/vendor_conversions_controller').default['approve']>>>
    }
  }
  'vendor_conversions.reject': {
    methods: ["PUT"]
    pattern: '/api/conversions/:id/reject'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/vendor_conversions_controller').default['reject']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/vendor_conversions_controller').default['reject']>>>
    }
  }
  'vendor_conversions.reverse': {
    methods: ["POST"]
    pattern: '/api/conversions/:id/reverse'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/vendor_conversions_controller').default['reverse']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/vendor_conversions_controller').default['reverse']>>>
    }
  }
  'commission_ledger.approve': {
    methods: ["POST"]
    pattern: '/api/commissions/:id/approve'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/commission_ledger_controller').default['approve']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/commission_ledger_controller').default['approve']>>>
    }
  }
  'commission_ledger.reject': {
    methods: ["POST"]
    pattern: '/api/commissions/:id/reject'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/commission_ledger_controller').default['reject']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/commission_ledger_controller').default['reject']>>>
    }
  }
  'commission_ledger.mark_as_paid': {
    methods: ["POST"]
    pattern: '/api/commissions/:id/mark-paid'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/commission_ledger_controller').default['markAsPaid']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/commission_ledger_controller').default['markAsPaid']>>>
    }
  }
  'commission_ledger.bulk_approve': {
    methods: ["POST"]
    pattern: '/api/commissions/bulk-approve'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/commission_ledger_controller').default['bulkApprove']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/commission_ledger_controller').default['bulkApprove']>>>
    }
  }
  'refunds_chargebacks.verify': {
    methods: ["POST"]
    pattern: '/api/refunds-chargebacks/:id/verify'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/refunds_chargebacks_controller').default['verify']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/refunds_chargebacks_controller').default['verify']>>>
    }
  }
  'refunds_chargebacks.approve': {
    methods: ["POST"]
    pattern: '/api/refunds-chargebacks/:id/approve'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/refunds_chargebacks_controller').default['approve']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/refunds_chargebacks_controller').default['approve']>>>
    }
  }
  'refunds_chargebacks.reject': {
    methods: ["POST"]
    pattern: '/api/refunds-chargebacks/:id/reject'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/refunds_chargebacks_controller').default['reject']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/refunds_chargebacks_controller').default['reject']>>>
    }
  }
  'refunds_chargebacks.complete': {
    methods: ["POST"]
    pattern: '/api/refunds-chargebacks/:id/complete'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/refunds_chargebacks_controller').default['complete']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/refunds_chargebacks_controller').default['complete']>>>
    }
  }
  'admin_fraud.get_flagged': {
    methods: ["GET","HEAD"]
    pattern: '/api/fraud-api/flagged'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_fraud_controller').default['getFlagged']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_fraud_controller').default['getFlagged']>>>
    }
  }
  'admin_fraud.approve_conversion': {
    methods: ["POST"]
    pattern: '/api/fraud-api/:id/approve'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_fraud_controller').default['approveConversion']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_fraud_controller').default['approveConversion']>>>
    }
  }
  'admin_fraud.reject_conversion': {
    methods: ["POST"]
    pattern: '/api/fraud-api/:id/reject'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_fraud_controller').default['rejectConversion']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_fraud_controller').default['rejectConversion']>>>
    }
  }
  'admin_fraud.get_stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/fraud-api/stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_fraud_controller').default['getStats']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_fraud_controller').default['getStats']>>>
    }
  }
  'admin_fraud.analyze_conversion': {
    methods: ["POST"]
    pattern: '/api/fraud-api/:id/analyze'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_fraud_controller').default['analyzeConversion']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_fraud_controller').default['analyzeConversion']>>>
    }
  }
  'admin_dispute.get_disputes': {
    methods: ["GET","HEAD"]
    pattern: '/api/disputes-api/list'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_dispute_controller').default['getDisputes']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_dispute_controller').default['getDisputes']>>>
    }
  }
  'admin_dispute.get_dispute': {
    methods: ["GET","HEAD"]
    pattern: '/api/disputes-api/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_dispute_controller').default['getDispute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_dispute_controller').default['getDispute']>>>
    }
  }
  'admin_dispute.add_evidence': {
    methods: ["POST"]
    pattern: '/api/disputes-api/:id/evidence'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_dispute_controller').default['addEvidence']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_dispute_controller').default['addEvidence']>>>
    }
  }
  'admin_dispute.escalate_dispute': {
    methods: ["POST"]
    pattern: '/api/disputes-api/:id/escalate'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_dispute_controller').default['escalateDispute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_dispute_controller').default['escalateDispute']>>>
    }
  }
  'admin_dispute.resolve_dispute': {
    methods: ["POST"]
    pattern: '/api/disputes-api/:id/resolve'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_dispute_controller').default['resolveDispute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_dispute_controller').default['resolveDispute']>>>
    }
  }
  'admin_dispute.get_stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/disputes-api/stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_dispute_controller').default['getStats']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_dispute_controller').default['getStats']>>>
    }
  }
  'admin_dispute.auto_resolve': {
    methods: ["POST"]
    pattern: '/api/disputes-api/auto-resolve'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_dispute_controller').default['autoResolve']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_dispute_controller').default['autoResolve']>>>
    }
  }
  'admin_payout.get_payouts': {
    methods: ["GET","HEAD"]
    pattern: '/api/payouts/list'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_payout_controller').default['getPayouts']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_payout_controller').default['getPayouts']>>>
    }
  }
  'admin_payout.check_status': {
    methods: ["POST"]
    pattern: '/api/payouts/:id/check-status'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_payout_controller').default['checkStatus']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_payout_controller').default['checkStatus']>>>
    }
  }
  'admin_payout.get_banks': {
    methods: ["GET","HEAD"]
    pattern: '/api/payouts/banks/list'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_payout_controller').default['getBanks']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_payout_controller').default['getBanks']>>>
    }
  }
  'admin_payout.verify_bank_account': {
    methods: ["POST"]
    pattern: '/api/payouts/bank/verify'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_payout_controller').default['verifyBankAccount']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_payout_controller').default['verifyBankAccount']>>>
    }
  }
  'admin_payout.get_stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/payouts/stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_payout_controller').default['getStats']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_payout_controller').default['getStats']>>>
    }
  }
  'admin_payout.handle_webhook': {
    methods: ["POST"]
    pattern: '/api/payouts/webhook/paystack'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_payout_controller').default['handleWebhook']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_payout_controller').default['handleWebhook']>>>
    }
  }
  'fraud_analytics.get_stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/fraud/stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/fraud_analytics_controller').default['getStats']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/fraud_analytics_controller').default['getStats']>>>
    }
  }
  'fraud_analytics.list_flagged': {
    methods: ["GET","HEAD"]
    pattern: '/api/fraud/flagged'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/fraud_analytics_controller').default['listFlagged']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/fraud_analytics_controller').default['listFlagged']>>>
    }
  }
  'fraud_analytics.get_fraud_details': {
    methods: ["GET","HEAD"]
    pattern: '/api/fraud/:id/details'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/fraud_analytics_controller').default['getFraudDetails']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/fraud_analytics_controller').default['getFraudDetails']>>>
    }
  }
  'fraud_analytics.approve_fraud_flag': {
    methods: ["POST"]
    pattern: '/api/fraud/:id/approve-flag'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/fraud_analytics_controller').default['approveFraudFlag']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/fraud_analytics_controller').default['approveFraudFlag']>>>
    }
  }
  'fraud_analytics.reject_fraud_flag': {
    methods: ["POST"]
    pattern: '/api/fraud/:id/reject-flag'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/fraud_analytics_controller').default['rejectFraudFlag']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/fraud_analytics_controller').default['rejectFraudFlag']>>>
    }
  }
  'fraud_analytics.auto_reject_high_risk': {
    methods: ["POST"]
    pattern: '/api/fraud/auto-reject-high-risk'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/fraud_analytics_controller').default['autoRejectHighRisk']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/fraud_analytics_controller').default['autoRejectHighRisk']>>>
    }
  }
  'fraud_analytics.get_trends': {
    methods: ["GET","HEAD"]
    pattern: '/api/fraud/trends'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/fraud_analytics_controller').default['getTrends']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/fraud_analytics_controller').default['getTrends']>>>
    }
  }
  'fraud_analytics.get_top_flags': {
    methods: ["GET","HEAD"]
    pattern: '/api/fraud/top-flags'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/fraud_analytics_controller').default['getTopFlags']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/fraud_analytics_controller').default['getTopFlags']>>>
    }
  }
  'analytics.get_metrics': {
    methods: ["GET","HEAD"]
    pattern: '/api/analytics/metrics'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/analytics_controller').default['getMetrics']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/analytics_controller').default['getMetrics']>>>
    }
  }
  'analytics.get_summary': {
    methods: ["GET","HEAD"]
    pattern: '/api/analytics/summary'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/analytics_controller').default['getSummary']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/analytics_controller').default['getSummary']>>>
    }
  }
  'analytics.list_campaigns': {
    methods: ["GET","HEAD"]
    pattern: '/api/analytics/campaigns'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/analytics_controller').default['listCampaigns']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/analytics_controller').default['listCampaigns']>>>
    }
  }
  'analytics.get_campaign_metrics': {
    methods: ["GET","HEAD"]
    pattern: '/api/analytics/campaigns/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/analytics_controller').default['getCampaignMetrics']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/analytics_controller').default['getCampaignMetrics']>>>
    }
  }
  'analytics.list_affiliates': {
    methods: ["GET","HEAD"]
    pattern: '/api/analytics/affiliates'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/analytics_controller').default['listAffiliates']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/analytics_controller').default['listAffiliates']>>>
    }
  }
  'analytics.get_affiliate_metrics': {
    methods: ["GET","HEAD"]
    pattern: '/api/analytics/affiliates/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/analytics_controller').default['getAffiliateMetrics']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/analytics_controller').default['getAffiliateMetrics']>>>
    }
  }
  'analytics.get_commissions': {
    methods: ["GET","HEAD"]
    pattern: '/api/analytics/commissions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/analytics_controller').default['getCommissions']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/analytics_controller').default['getCommissions']>>>
    }
  }
  'analytics.get_commission_schedule': {
    methods: ["GET","HEAD"]
    pattern: '/api/analytics/commission-schedule'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/analytics_controller').default['getCommissionSchedule']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/analytics_controller').default['getCommissionSchedule']>>>
    }
  }
  'analytics.export_conversions': {
    methods: ["GET","HEAD"]
    pattern: '/api/analytics/export/conversions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/analytics_controller').default['exportConversions']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/analytics_controller').default['exportConversions']>>>
    }
  }
  'analytics.export_commissions': {
    methods: ["GET","HEAD"]
    pattern: '/api/analytics/export/commissions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/analytics_controller').default['exportCommissions']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/analytics_controller').default['exportCommissions']>>>
    }
  }
  'influencers.create_profile': {
    methods: ["POST"]
    pattern: '/api/influencers/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['createProfile']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['createProfile']>>>
    }
  }
  'influencers.get_profile': {
    methods: ["GET","HEAD"]
    pattern: '/api/influencers/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['getProfile']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['getProfile']>>>
    }
  }
  'influencers.update_profile': {
    methods: ["PUT"]
    pattern: '/api/influencers/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['updateProfile']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['updateProfile']>>>
    }
  }
  'influencers.get_stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/influencers/stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['getStats']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['getStats']>>>
    }
  }
  'influencers.list_collaborations': {
    methods: ["GET","HEAD"]
    pattern: '/api/influencers/collaborations'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['listCollaborations']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['listCollaborations']>>>
    }
  }
  'influencers.get_collaboration': {
    methods: ["GET","HEAD"]
    pattern: '/api/influencers/collaborations/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['getCollaboration']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['getCollaboration']>>>
    }
  }
  'influencers.accept_collaboration': {
    methods: ["POST"]
    pattern: '/api/influencers/collaborations/:id/accept'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['acceptCollaboration']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['acceptCollaboration']>>>
    }
  }
  'influencers.create_content': {
    methods: ["POST"]
    pattern: '/api/influencers/content'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['createContent']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['createContent']>>>
    }
  }
  'influencers.list_content': {
    methods: ["GET","HEAD"]
    pattern: '/api/influencers/content'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['listContent']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['listContent']>>>
    }
  }
  'influencers.get_content_analytics': {
    methods: ["GET","HEAD"]
    pattern: '/api/influencers/content/:id/analytics'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['getContentAnalytics']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['getContentAnalytics']>>>
    }
  }
  'influencers.get_content_performance': {
    methods: ["GET","HEAD"]
    pattern: '/api/influencers/content/performance'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['getContentPerformance']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['getContentPerformance']>>>
    }
  }
  'influencers.update_content': {
    methods: ["PUT"]
    pattern: '/api/influencers/content/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['updateContent']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['updateContent']>>>
    }
  }
  'influencers.list_influencers': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/influencers'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['listInfluencers']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['listInfluencers']>>>
    }
  }
  'influencers.view_influencer': {
    methods: ["GET","HEAD"]
    pattern: '/api/admin/influencers/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['viewInfluencer']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['viewInfluencer']>>>
    }
  }
  'influencers.verify_influencer': {
    methods: ["POST"]
    pattern: '/api/admin/influencers/:id/verify'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['verifyInfluencer']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['verifyInfluencer']>>>
    }
  }
  'influencers.reject_influencer': {
    methods: ["POST"]
    pattern: '/api/admin/influencers/:id/reject'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['rejectInfluencer']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/influencers_controller').default['rejectInfluencer']>>>
    }
  }
  'shopify.get_auth_url': {
    methods: ["GET","HEAD"]
    pattern: '/api/shopify/auth-url'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/shopify_controller').default['getAuthUrl']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/shopify_controller').default['getAuthUrl']>>>
    }
  }
  'shopify.get_store': {
    methods: ["GET","HEAD"]
    pattern: '/api/shopify/store'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/shopify_controller').default['getStore']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/shopify_controller').default['getStore']>>>
    }
  }
  'shopify.disconnect': {
    methods: ["POST"]
    pattern: '/api/shopify/disconnect'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/shopify_controller').default['disconnect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/shopify_controller').default['disconnect']>>>
    }
  }
  'shopify.sync_products': {
    methods: ["POST"]
    pattern: '/api/shopify/sync/products'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/shopify_controller').default['syncProducts']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/shopify_controller').default['syncProducts']>>>
    }
  }
  'shopify.sync_orders': {
    methods: ["POST"]
    pattern: '/api/shopify/sync/orders'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/shopify_controller').default['syncOrders']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/shopify_controller').default['syncOrders']>>>
    }
  }
  'shopify.list_products': {
    methods: ["GET","HEAD"]
    pattern: '/api/shopify/products'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/shopify_controller').default['listProducts']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/shopify_controller').default['listProducts']>>>
    }
  }
  'shopify.update_product': {
    methods: ["PUT"]
    pattern: '/api/shopify/products/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/shopify_controller').default['updateProduct']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/shopify_controller').default['updateProduct']>>>
    }
  }
  'shopify.list_orders': {
    methods: ["GET","HEAD"]
    pattern: '/api/shopify/orders'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/shopify_controller').default['listOrders']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/shopify_controller').default['listOrders']>>>
    }
  }
  'shopify.get_order': {
    methods: ["GET","HEAD"]
    pattern: '/api/shopify/orders/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/shopify_controller').default['getOrder']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/shopify_controller').default['getOrder']>>>
    }
  }
  'shopify.calculate_commissions': {
    methods: ["POST"]
    pattern: '/api/shopify/commissions/calculate'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/shopify_controller').default['calculateCommissions']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/shopify_controller').default['calculateCommissions']>>>
    }
  }
  'shopify.get_analytics': {
    methods: ["GET","HEAD"]
    pattern: '/api/shopify/analytics'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/shopify_controller').default['getAnalytics']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/shopify_controller').default['getAnalytics']>>>
    }
  }
  'woocommerce.connect': {
    methods: ["POST"]
    pattern: '/api/woocommerce/connect'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/woocommerce_controller').default['connect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/woocommerce_controller').default['connect']>>>
    }
  }
  'woocommerce.get_store': {
    methods: ["GET","HEAD"]
    pattern: '/api/woocommerce/store'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/woocommerce_controller').default['getStore']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/woocommerce_controller').default['getStore']>>>
    }
  }
  'woocommerce.disconnect': {
    methods: ["POST"]
    pattern: '/api/woocommerce/disconnect'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/woocommerce_controller').default['disconnect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/woocommerce_controller').default['disconnect']>>>
    }
  }
  'woocommerce.sync_products': {
    methods: ["POST"]
    pattern: '/api/woocommerce/sync/products'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/woocommerce_controller').default['syncProducts']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/woocommerce_controller').default['syncProducts']>>>
    }
  }
  'woocommerce.sync_orders': {
    methods: ["POST"]
    pattern: '/api/woocommerce/sync/orders'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/woocommerce_controller').default['syncOrders']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/woocommerce_controller').default['syncOrders']>>>
    }
  }
  'woocommerce.list_products': {
    methods: ["GET","HEAD"]
    pattern: '/api/woocommerce/products'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/woocommerce_controller').default['listProducts']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/woocommerce_controller').default['listProducts']>>>
    }
  }
  'woocommerce.update_product': {
    methods: ["PUT"]
    pattern: '/api/woocommerce/products/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/woocommerce_controller').default['updateProduct']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/woocommerce_controller').default['updateProduct']>>>
    }
  }
  'woocommerce.list_orders': {
    methods: ["GET","HEAD"]
    pattern: '/api/woocommerce/orders'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/woocommerce_controller').default['listOrders']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/woocommerce_controller').default['listOrders']>>>
    }
  }
  'woocommerce.calculate_commissions': {
    methods: ["POST"]
    pattern: '/api/woocommerce/commissions/calculate'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/woocommerce_controller').default['calculateCommissions']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/woocommerce_controller').default['calculateCommissions']>>>
    }
  }
  'woocommerce.get_analytics': {
    methods: ["GET","HEAD"]
    pattern: '/api/woocommerce/analytics'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/woocommerce_controller').default['getAnalytics']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/woocommerce_controller').default['getAnalytics']>>>
    }
  }
  'currency.format_amount': {
    methods: ["POST"]
    pattern: '/api/currencies/format'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/currency_controller').default['formatAmount']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/currency_controller').default['formatAmount']>>>
    }
  }
  'currency.get_regional_price': {
    methods: ["GET","HEAD"]
    pattern: '/api/products/:id/price/:region'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; region: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/currency_controller').default['getRegionalPrice']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/currency_controller').default['getRegionalPrice']>>>
    }
  }
  'currency.set_regional_pricing': {
    methods: ["POST"]
    pattern: '/api/products/:id/pricing'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/currency_controller').default['setRegionalPricing']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/currency_controller').default['setRegionalPricing']>>>
    }
  }
  'currency.list_product_pricing': {
    methods: ["GET","HEAD"]
    pattern: '/api/products/:id/pricing'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/currency_controller').default['listProductPricing']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/currency_controller').default['listProductPricing']>>>
    }
  }
  'currency.update_exchange_rates': {
    methods: ["POST"]
    pattern: '/api/admin/currencies/rates'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/currency_controller').default['updateExchangeRates']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/currency_controller').default['updateExchangeRates']>>>
    }
  }
  'admin.update_user': {
    methods: ["PUT"]
    pattern: '/api/users/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_controller').default['updateUser']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_controller').default['updateUser']>>>
    }
  }
  'admin.delete_user': {
    methods: ["DELETE"]
    pattern: '/api/users/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_controller').default['deleteUser']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_controller').default['deleteUser']>>>
    }
  }
  'reviews.approve': {
    methods: ["POST"]
    pattern: '/api/reviews/:id/approve'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/review').updateReviewValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/review').updateReviewValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reviews_controller').default['approve']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reviews_controller').default['approve']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'payouts.admin_index': {
    methods: ["GET","HEAD"]
    pattern: '/api/payouts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payouts_controller').default['adminIndex']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payouts_controller').default['adminIndex']>>>
    }
  }
  'payouts.approve': {
    methods: ["POST"]
    pattern: '/api/payouts/:id/approve'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payouts_controller').default['approve']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payouts_controller').default['approve']>>>
    }
  }
  'payouts.reject': {
    methods: ["POST"]
    pattern: '/api/payouts/:id/reject'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payouts_controller').default['reject']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payouts_controller').default['reject']>>>
    }
  }
  'payouts.process': {
    methods: ["POST"]
    pattern: '/api/payouts/:id/process'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payouts_controller').default['process']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payouts_controller').default['process']>>>
    }
  }
  'payouts.complete': {
    methods: ["POST"]
    pattern: '/api/payouts/:id/complete'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payouts_controller').default['complete']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payouts_controller').default['complete']>>>
    }
  }
  'payouts.fail': {
    methods: ["POST"]
    pattern: '/api/payouts/:id/fail'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payouts_controller').default['fail']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payouts_controller').default['fail']>>>
    }
  }
  'blog_posts.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/blog-posts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog_posts_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog_posts_controller').default['index']>>>
    }
  }
  'blog_posts.store': {
    methods: ["POST"]
    pattern: '/api/blog-posts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog_posts_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog_posts_controller').default['store']>>>
    }
  }
  'blog_posts.update': {
    methods: ["PUT"]
    pattern: '/api/blog-posts/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog_posts_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog_posts_controller').default['update']>>>
    }
  }
  'blog_posts.destroy': {
    methods: ["DELETE"]
    pattern: '/api/blog-posts/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog_posts_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog_posts_controller').default['destroy']>>>
    }
  }
  'newsletter_admin.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/newsletters'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/newsletter_admin_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/newsletter_admin_controller').default['index']>>>
    }
  }
  'newsletter_admin.store': {
    methods: ["POST"]
    pattern: '/api/newsletters'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/newsletter_admin_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/newsletter_admin_controller').default['store']>>>
    }
  }
  'newsletter_admin.update': {
    methods: ["PUT"]
    pattern: '/api/newsletters/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/newsletter_admin_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/newsletter_admin_controller').default['update']>>>
    }
  }
  'newsletter_admin.destroy': {
    methods: ["DELETE"]
    pattern: '/api/newsletters/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/newsletter_admin_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/newsletter_admin_controller').default['destroy']>>>
    }
  }
  'email_campaigns.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/email-campaigns'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/email_campaigns_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/email_campaigns_controller').default['index']>>>
    }
  }
  'email_campaigns.store': {
    methods: ["POST"]
    pattern: '/api/email-campaigns'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/email_campaigns_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/email_campaigns_controller').default['store']>>>
    }
  }
  'email_campaigns.update': {
    methods: ["PUT"]
    pattern: '/api/email-campaigns/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/email_campaigns_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/email_campaigns_controller').default['update']>>>
    }
  }
  'email_campaigns.destroy': {
    methods: ["DELETE"]
    pattern: '/api/email-campaigns/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/email_campaigns_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/email_campaigns_controller').default['destroy']>>>
    }
  }
  'site_settings.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/site-settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/site_settings_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/site_settings_controller').default['index']>>>
    }
  }
  'site_settings.upsert': {
    methods: ["POST"]
    pattern: '/api/site-settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/site_settings_controller').default['upsert']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/site_settings_controller').default['upsert']>>>
    }
  }
  'site_settings.upload_image': {
    methods: ["POST"]
    pattern: '/api/site-settings/upload-image'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/site_settings_controller').default['uploadImage']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/site_settings_controller').default['uploadImage']>>>
    }
  }
  'site_settings.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/site-settings/:key'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { key: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/site_settings_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/site_settings_controller').default['show']>>>
    }
  }
  'webhook.get_webhook_endpoints': {
    methods: ["GET","HEAD"]
    pattern: '/api/payments/webhook-endpoints'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/webhook_controller').default['getWebhookEndpoints']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/webhook_controller').default['getWebhookEndpoints']>>>
    }
  }
  'webhook.test_webhook': {
    methods: ["POST"]
    pattern: '/api/payments/webhook-test/:provider'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { provider: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/webhook_controller').default['testWebhook']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/webhook_controller').default['testWebhook']>>>
    }
  }
  'payment_settings.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/payment-gateway-settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payment_settings_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payment_settings_controller').default['index']>>>
    }
  }
  'payment_settings.status_list': {
    methods: ["GET","HEAD"]
    pattern: '/api/payment-gateway-settings/status/list'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payment_settings_controller').default['statusList']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payment_settings_controller').default['statusList']>>>
    }
  }
  'payment_settings.store': {
    methods: ["POST"]
    pattern: '/api/payment-gateway-settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payment_settings_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payment_settings_controller').default['store']>>>
    }
  }
  'payment_settings.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/payment-gateway-settings/:gateway'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { gateway: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payment_settings_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payment_settings_controller').default['show']>>>
    }
  }
  'payment_settings.update': {
    methods: ["PUT"]
    pattern: '/api/payment-gateway-settings/:gateway'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { gateway: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payment_settings_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payment_settings_controller').default['update']>>>
    }
  }
  'payment_settings.toggle': {
    methods: ["PATCH"]
    pattern: '/api/payment-gateway-settings/:gateway/toggle'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { gateway: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payment_settings_controller').default['toggle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payment_settings_controller').default['toggle']>>>
    }
  }
  'payment_settings.destroy': {
    methods: ["DELETE"]
    pattern: '/api/payment-gateway-settings/:gateway'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { gateway: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payment_settings_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payment_settings_controller').default['destroy']>>>
    }
  }
  'kyc.list_pending_submissions': {
    methods: ["GET","HEAD"]
    pattern: '/api/kyc/admin/pending'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/kyc_controller').default['listPendingSubmissions']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/kyc_controller').default['listPendingSubmissions']>>>
    }
  }
  'kyc.get_statistics': {
    methods: ["GET","HEAD"]
    pattern: '/api/kyc/admin/statistics'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/kyc_controller').default['getStatistics']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/kyc_controller').default['getStatistics']>>>
    }
  }
  'kyc.search_submissions': {
    methods: ["GET","HEAD"]
    pattern: '/api/kyc/admin/search'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/kyc_controller').default['searchSubmissions']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/kyc_controller').default['searchSubmissions']>>>
    }
  }
  'kyc.verify_document': {
    methods: ["POST"]
    pattern: '/api/kyc/:submissionId/verify-document/:documentId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { submissionId: ParamValue; documentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/kyc_controller').default['verifyDocument']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/kyc_controller').default['verifyDocument']>>>
    }
  }
  'kyc.assess_risk': {
    methods: ["POST"]
    pattern: '/api/kyc/:submissionId/assess-risk'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { submissionId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/kyc_controller').default['assessRisk']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/kyc_controller').default['assessRisk']>>>
    }
  }
  'kyc.check_compliance': {
    methods: ["POST"]
    pattern: '/api/kyc/:submissionId/check-compliance'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { submissionId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/kyc_controller').default['checkCompliance']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/kyc_controller').default['checkCompliance']>>>
    }
  }
  'kyc.approve_submission': {
    methods: ["POST"]
    pattern: '/api/kyc/:submissionId/approve'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { submissionId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/kyc_controller').default['approveSubmission']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/kyc_controller').default['approveSubmission']>>>
    }
  }
  'kyc.reject_submission': {
    methods: ["POST"]
    pattern: '/api/kyc/:submissionId/reject'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { submissionId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/kyc_controller').default['rejectSubmission']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/kyc_controller').default['rejectSubmission']>>>
    }
  }
  'reports.create_configuration': {
    methods: ["POST"]
    pattern: '/api/reports'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['createConfiguration']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['createConfiguration']>>>
    }
  }
  'reports.list_configurations': {
    methods: ["GET","HEAD"]
    pattern: '/api/reports'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['listConfigurations']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['listConfigurations']>>>
    }
  }
  'reports.get_configuration': {
    methods: ["GET","HEAD"]
    pattern: '/api/reports/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['getConfiguration']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['getConfiguration']>>>
    }
  }
  'reports.update_configuration': {
    methods: ["PUT"]
    pattern: '/api/reports/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['updateConfiguration']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['updateConfiguration']>>>
    }
  }
  'reports.delete_configuration': {
    methods: ["DELETE"]
    pattern: '/api/reports/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['deleteConfiguration']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['deleteConfiguration']>>>
    }
  }
  'reports.generate_report': {
    methods: ["POST"]
    pattern: '/api/reports/:id/generate'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['generateReport']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['generateReport']>>>
    }
  }
  'reports.list_report_logs': {
    methods: ["GET","HEAD"]
    pattern: '/api/reports/:id/logs'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['listReportLogs']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['listReportLogs']>>>
    }
  }
  'reports.get_report_log': {
    methods: ["GET","HEAD"]
    pattern: '/api/reports/logs/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['getReportLog']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['getReportLog']>>>
    }
  }
  'reports.download_report': {
    methods: ["GET","HEAD"]
    pattern: '/api/reports/logs/:id/download'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['downloadReport']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['downloadReport']>>>
    }
  }
  'reports.create_schedule': {
    methods: ["POST"]
    pattern: '/api/reports/:id/schedules'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['createSchedule']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['createSchedule']>>>
    }
  }
  'reports.list_schedules': {
    methods: ["GET","HEAD"]
    pattern: '/api/reports/:id/schedules'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['listSchedules']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['listSchedules']>>>
    }
  }
  'reports.update_schedule': {
    methods: ["PUT"]
    pattern: '/api/reports/schedules/:scheduleId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { scheduleId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['updateSchedule']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['updateSchedule']>>>
    }
  }
  'reports.delete_schedule': {
    methods: ["DELETE"]
    pattern: '/api/reports/schedules/:scheduleId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { scheduleId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['deleteSchedule']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['deleteSchedule']>>>
    }
  }
  'reports.archive_report': {
    methods: ["POST"]
    pattern: '/api/reports/:id/archive'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['archiveReport']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['archiveReport']>>>
    }
  }
  'reports.get_stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/reports/stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['getStats']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['getStats']>>>
    }
  }
  'disputes.list_open_disputes': {
    methods: ["GET","HEAD"]
    pattern: '/api/disputes/open'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['listOpenDisputes']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['listOpenDisputes']>>>
    }
  }
  'disputes.list_escalated_disputes': {
    methods: ["GET","HEAD"]
    pattern: '/api/disputes/escalated'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['listEscalatedDisputes']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['listEscalatedDisputes']>>>
    }
  }
  'disputes.filter_disputes': {
    methods: ["GET","HEAD"]
    pattern: '/api/disputes/filter'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['filterDisputes']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['filterDisputes']>>>
    }
  }
  'disputes.get_dashboard_stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/disputes/stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['getDashboardStats']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['getDashboardStats']>>>
    }
  }
  'disputes.update_status': {
    methods: ["POST"]
    pattern: '/api/disputes/:id/status'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['updateStatus']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['updateStatus']>>>
    }
  }
  'disputes.resolve_dispute': {
    methods: ["POST"]
    pattern: '/api/disputes/:id/resolve'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['resolveDispute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['resolveDispute']>>>
    }
  }
  'disputes.assign_dispute': {
    methods: ["POST"]
    pattern: '/api/disputes/:id/assign'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['assignDispute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['assignDispute']>>>
    }
  }
  'disputes.escalate_dispute': {
    methods: ["POST"]
    pattern: '/api/disputes/:id/escalate'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['escalateDispute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['escalateDispute']>>>
    }
  }
  'disputes.request_approval': {
    methods: ["POST"]
    pattern: '/api/disputes/:id/request-approval'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['requestApproval']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['requestApproval']>>>
    }
  }
  'disputes.approve_dispute': {
    methods: ["POST"]
    pattern: '/api/disputes/approvals/:approvalId/approve'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { approvalId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['approveDispute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['approveDispute']>>>
    }
  }
  'disputes.reject_dispute': {
    methods: ["POST"]
    pattern: '/api/disputes/approvals/:approvalId/reject'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { approvalId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['rejectDispute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['rejectDispute']>>>
    }
  }
  'affiliates.create_campaign': {
    methods: ["POST"]
    pattern: '/api/recruitment/campaigns'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['createCampaign']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['createCampaign']>>>
    }
  }
  'affiliates.list_campaigns': {
    methods: ["GET","HEAD"]
    pattern: '/api/recruitment/campaigns'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['listCampaigns']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['listCampaigns']>>>
    }
  }
  'affiliates.launch_campaign': {
    methods: ["POST"]
    pattern: '/api/recruitment/campaigns/:id/launch'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['launchCampaign']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['launchCampaign']>>>
    }
  }
  'affiliates.complete_campaign': {
    methods: ["POST"]
    pattern: '/api/recruitment/campaigns/:id/complete'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['completeCampaign']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['completeCampaign']>>>
    }
  }
  'disputes.file_dispute': {
    methods: ["POST"]
    pattern: '/api/disputes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['fileDispute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['fileDispute']>>>
    }
  }
  'disputes.list_user_disputes': {
    methods: ["GET","HEAD"]
    pattern: '/api/disputes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['listUserDisputes']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['listUserDisputes']>>>
    }
  }
  'disputes.get_dispute': {
    methods: ["GET","HEAD"]
    pattern: '/api/disputes/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['getDispute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['getDispute']>>>
    }
  }
  'disputes.get_comments': {
    methods: ["GET","HEAD"]
    pattern: '/api/disputes/:id/comments'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['getComments']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['getComments']>>>
    }
  }
  'disputes.add_comment': {
    methods: ["POST"]
    pattern: '/api/disputes/:id/comments'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['addComment']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/disputes_controller').default['addComment']>>>
    }
  }
  'amazon.get_auth_url': {
    methods: ["GET","HEAD"]
    pattern: '/api/amazon/auth-url'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/amazon_controller').default['getAuthUrl']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/amazon_controller').default['getAuthUrl']>>>
    }
  }
  'amazon.handle_callback': {
    methods: ["GET","HEAD"]
    pattern: '/api/amazon/callback'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/amazon_controller').default['handleCallback']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/amazon_controller').default['handleCallback']>>>
    }
  }
  'amazon.list_accounts': {
    methods: ["GET","HEAD"]
    pattern: '/api/amazon/accounts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/amazon_controller').default['listAccounts']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/amazon_controller').default['listAccounts']>>>
    }
  }
  'amazon.get_campaigns': {
    methods: ["GET","HEAD"]
    pattern: '/api/amazon/campaigns'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/amazon_controller').default['getCampaigns']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/amazon_controller').default['getCampaigns']>>>
    }
  }
  'etsy.get_auth_url': {
    methods: ["GET","HEAD"]
    pattern: '/api/etsy/auth-url'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/etsy_controller').default['getAuthUrl']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/etsy_controller').default['getAuthUrl']>>>
    }
  }
  'etsy.handle_callback': {
    methods: ["GET","HEAD"]
    pattern: '/api/etsy/callback'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/etsy_controller').default['handleCallback']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/etsy_controller').default['handleCallback']>>>
    }
  }
  'etsy.list_shops': {
    methods: ["GET","HEAD"]
    pattern: '/api/etsy/shops'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/etsy_controller').default['listShops']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/etsy_controller').default['listShops']>>>
    }
  }
  'etsy.get_listings': {
    methods: ["GET","HEAD"]
    pattern: '/api/etsy/listings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/etsy_controller').default['getListings']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/etsy_controller').default['getListings']>>>
    }
  }
  'etsy.get_orders': {
    methods: ["GET","HEAD"]
    pattern: '/api/etsy/orders'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/etsy_controller').default['getOrders']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/etsy_controller').default['getOrders']>>>
    }
  }
  'affiliates.create_profile': {
    methods: ["POST"]
    pattern: '/api/affiliate/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['createProfile']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['createProfile']>>>
    }
  }
  'affiliates.get_profile': {
    methods: ["GET","HEAD"]
    pattern: '/api/affiliate/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['getProfile']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['getProfile']>>>
    }
  }
  'affiliates.update_profile': {
    methods: ["PUT"]
    pattern: '/api/affiliate/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['updateProfile']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['updateProfile']>>>
    }
  }
  'affiliates.generate_referral_code': {
    methods: ["POST"]
    pattern: '/api/affiliate/referral-codes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['generateReferralCode']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['generateReferralCode']>>>
    }
  }
  'affiliates.get_referral_codes': {
    methods: ["GET","HEAD"]
    pattern: '/api/affiliate/referral-codes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['getReferralCodes']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['getReferralCodes']>>>
    }
  }
  'affiliates.get_referral_code_performance': {
    methods: ["GET","HEAD"]
    pattern: '/api/affiliate/referral-codes/:id/performance'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['getReferralCodePerformance']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['getReferralCodePerformance']>>>
    }
  }
  'affiliates.get_referrals': {
    methods: ["GET","HEAD"]
    pattern: '/api/affiliate/referrals'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['getReferrals']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['getReferrals']>>>
    }
  }
  'affiliates.get_rewards': {
    methods: ["GET","HEAD"]
    pattern: '/api/affiliate/rewards'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['getRewards']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['getRewards']>>>
    }
  }
  'affiliates.claim_reward': {
    methods: ["POST"]
    pattern: '/api/affiliate/rewards/:id/claim'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['claimReward']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliates_controller').default['claimReward']>>>
    }
  }
  'mobile_api.register_device': {
    methods: ["POST"]
    pattern: '/api/mobile/devices/register'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/mobile_api_controller').default['registerDevice']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/mobile_api_controller').default['registerDevice']>>>
    }
  }
  'mobile_api.validate_token': {
    methods: ["POST"]
    pattern: '/api/mobile/token/validate'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/mobile_api_controller').default['validateToken']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/mobile_api_controller').default['validateToken']>>>
    }
  }
  'affiliate_dashboard.overview': {
    methods: ["GET","HEAD"]
    pattern: '/api/affiliate-dashboard/overview'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliate_dashboard_controller').default['overview']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliate_dashboard_controller').default['overview']>>>
    }
  }
  'affiliate_dashboard.links': {
    methods: ["GET","HEAD"]
    pattern: '/api/affiliate-dashboard/links'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliate_dashboard_controller').default['links']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliate_dashboard_controller').default['links']>>>
    }
  }
  'affiliate_dashboard.available_campaigns': {
    methods: ["GET","HEAD"]
    pattern: '/api/affiliate-dashboard/campaigns'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliate_dashboard_controller').default['availableCampaigns']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliate_dashboard_controller').default['availableCampaigns']>>>
    }
  }
  'affiliate_dashboard.commissions': {
    methods: ["GET","HEAD"]
    pattern: '/api/affiliate-dashboard/commissions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliate_dashboard_controller').default['commissions']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliate_dashboard_controller').default['commissions']>>>
    }
  }
  'affiliate_dashboard.payouts': {
    methods: ["GET","HEAD"]
    pattern: '/api/affiliate-dashboard/payouts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliate_dashboard_controller').default['payouts']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliate_dashboard_controller').default['payouts']>>>
    }
  }
  'affiliate_dashboard.earnings_breakdown': {
    methods: ["GET","HEAD"]
    pattern: '/api/affiliate-dashboard/earnings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliate_dashboard_controller').default['earningsBreakdown']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliate_dashboard_controller').default['earningsBreakdown']>>>
    }
  }
  'affiliate_dashboard.trending': {
    methods: ["GET","HEAD"]
    pattern: '/api/affiliate-dashboard/trending'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliate_dashboard_controller').default['trending']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliate_dashboard_controller').default['trending']>>>
    }
  }
  'affiliate_dashboard.trends': {
    methods: ["GET","HEAD"]
    pattern: '/api/affiliate-dashboard/trends'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliate_dashboard_controller').default['trends']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliate_dashboard_controller').default['trends']>>>
    }
  }
  'vendor_dashboard.overview': {
    methods: ["GET","HEAD"]
    pattern: '/api/vendor-dashboard/overview'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/vendor_dashboard_controller').default['overview']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/vendor_dashboard_controller').default['overview']>>>
    }
  }
  'vendor_dashboard.campaigns': {
    methods: ["GET","HEAD"]
    pattern: '/api/vendor-dashboard/campaigns'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/vendor_dashboard_controller').default['campaigns']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/vendor_dashboard_controller').default['campaigns']>>>
    }
  }
  'vendor_dashboard.top_affiliates': {
    methods: ["GET","HEAD"]
    pattern: '/api/vendor-dashboard/affiliates'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/vendor_dashboard_controller').default['topAffiliates']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/vendor_dashboard_controller').default['topAffiliates']>>>
    }
  }
  'vendor_dashboard.financials': {
    methods: ["GET","HEAD"]
    pattern: '/api/vendor-dashboard/financials'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/vendor_dashboard_controller').default['financials']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/vendor_dashboard_controller').default['financials']>>>
    }
  }
  'vendor_dashboard.activity': {
    methods: ["GET","HEAD"]
    pattern: '/api/vendor-dashboard/activity'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/vendor_dashboard_controller').default['activity']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/vendor_dashboard_controller').default['activity']>>>
    }
  }
  'vendor_dashboard.campaign_details': {
    methods: ["GET","HEAD"]
    pattern: '/api/vendor-dashboard/campaign/:campaignId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { campaignId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/vendor_dashboard_controller').default['campaignDetails']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/vendor_dashboard_controller').default['campaignDetails']>>>
    }
  }
  'vendor_dashboard.earnings_breakdown': {
    methods: ["GET","HEAD"]
    pattern: '/api/vendor-dashboard/earnings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/vendor_dashboard_controller').default['earningsBreakdown']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/vendor_dashboard_controller').default['earningsBreakdown']>>>
    }
  }
  'vendor_dashboard.trends': {
    methods: ["GET","HEAD"]
    pattern: '/api/vendor-dashboard/trends'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/vendor_dashboard_controller').default['trends']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/vendor_dashboard_controller').default['trends']>>>
    }
  }
  'kyc.create_submission': {
    methods: ["POST"]
    pattern: '/api/kyc/submit'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/kyc_controller').default['createSubmission']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/kyc_controller').default['createSubmission']>>>
    }
  }
  'kyc.upload_document': {
    methods: ["POST"]
    pattern: '/api/kyc/:submissionId/documents'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { submissionId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/kyc_controller').default['uploadDocument']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/kyc_controller').default['uploadDocument']>>>
    }
  }
  'kyc.get_submission': {
    methods: ["GET","HEAD"]
    pattern: '/api/kyc/:submissionId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { submissionId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/kyc_controller').default['getSubmission']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/kyc_controller').default['getSubmission']>>>
    }
  }
  'kyc.get_audit_trail': {
    methods: ["GET","HEAD"]
    pattern: '/api/kyc/:submissionId/audit-trail'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { submissionId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/kyc_controller').default['getAuditTrail']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/kyc_controller').default['getAuditTrail']>>>
    }
  }
}
