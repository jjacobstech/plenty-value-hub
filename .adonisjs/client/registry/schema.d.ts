/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
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
  'api.subscribe_newsletter': {
    methods: ["POST"]
    pattern: '/api/newsletters'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api_controller').default['subscribeNewsletter']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api_controller').default['subscribeNewsletter']>>>
    }
  }
  'api.create_review': {
    methods: ["POST"]
    pattern: '/api/reviews'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api_controller').default['createReview']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api_controller').default['createReview']>>>
    }
  }
  'api.create_affiliate_link': {
    methods: ["POST"]
    pattern: '/api/affiliate-links'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api_controller').default['createAffiliateLink']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api_controller').default['createAffiliateLink']>>>
    }
  }
  'api.affiliate_redirect': {
    methods: ["POST"]
    pattern: '/api/affiliate-redirect'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api_controller').default['affiliateRedirect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api_controller').default['affiliateRedirect']>>>
    }
  }
  'api.create_order': {
    methods: ["POST"]
    pattern: '/api/orders'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api_controller').default['createOrder']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api_controller').default['createOrder']>>>
    }
  }
}
