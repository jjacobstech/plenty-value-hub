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
      body: ExtractBody<InferInput<(typeof import('#validators/affiliate_link').trackClickValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/affiliate_link').trackClickValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliate_links_controller').default['trackClick']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliate_links_controller').default['trackClick']>>> | { status: 422; response: { errors: SimpleError[] } }
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
  'affiliate_links.store': {
    methods: ["POST"]
    pattern: '/api/affiliate-links'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/affiliate_link').createAffiliateLinkValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/affiliate_link').createAffiliateLinkValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliate_links_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliate_links_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'affiliate_links.update': {
    methods: ["PUT"]
    pattern: '/api/affiliate-links/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/affiliate_link').updateAffiliateLinkValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/affiliate_link').updateAffiliateLinkValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/affiliate_links_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/affiliate_links_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
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
  'wallet.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/wallet'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/wallet_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/wallet_controller').default['show']>>>
    }
  }
  'wallet.request_payout': {
    methods: ["POST"]
    pattern: '/api/wallet/payouts'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/wallet').requestPayoutValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/wallet').requestPayoutValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/wallet_controller').default['requestPayout']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/wallet_controller').default['requestPayout']>>> | { status: 422; response: { errors: SimpleError[] } }
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
  'orders.update_status': {
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
  'wallet.admin_index': {
    methods: ["GET","HEAD"]
    pattern: '/api/payouts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/wallet_controller').default['adminIndex']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/wallet_controller').default['adminIndex']>>>
    }
  }
  'wallet.admin_update': {
    methods: ["PUT"]
    pattern: '/api/payouts/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/wallet').updatePayoutValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/wallet').updatePayoutValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/wallet_controller').default['adminUpdate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/wallet_controller').default['adminUpdate']>>> | { status: 422; response: { errors: SimpleError[] } }
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
}
