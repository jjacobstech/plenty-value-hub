/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  marketplace: typeof routes['marketplace']
  reviews: typeof routes['reviews']
  product: {
    detail: typeof routes['product.detail']
  }
  affiliate: {
    redirect: typeof routes['affiliate.redirect']
    dashboard: typeof routes['affiliate.dashboard']
    products: typeof routes['affiliate.products']
    links: typeof routes['affiliate.links']
    earnings: typeof routes['affiliate.earnings']
    performance: typeof routes['affiliate.performance']
    profile: typeof routes['affiliate.profile']
  }
  for: {
    partners: typeof routes['for.partners']
  }
  privacy: typeof routes['privacy']
  register: typeof routes['register']
  newAccount: {
    registerStep1: typeof routes['new_account.register_step_1']
    registerStep2: typeof routes['new_account.register_step_2']
    registerStep3: typeof routes['new_account.register_step_3']
    verifyOtp: typeof routes['new_account.verify_otp']
    resendOtp: typeof routes['new_account.resend_otp']
    login: typeof routes['new_account.login']
    forgotPassword: typeof routes['new_account.forgot_password']
    resetPassword: typeof routes['new_account.reset_password']
  }
  login: typeof routes['login']
  forgot: {
    password: typeof routes['forgot.password']
  }
  reset: {
    password: typeof routes['reset.password']
  }
  google: {
    redirect: typeof routes['google.redirect']
    callback: typeof routes['google.callback']
  }
  logout: typeof routes['logout']
  admin: {
    dashboard: typeof routes['admin.dashboard']
    users: typeof routes['admin.users']
    products: typeof routes['admin.products']
    orders: typeof routes['admin.orders']
    analytics: typeof routes['admin.analytics']
  }
  vendor: {
    dashboard: typeof routes['vendor.dashboard']
    products: typeof routes['vendor.products']
    kyc: typeof routes['vendor.kyc']
    earnings: typeof routes['vendor.earnings']
    analytics: typeof routes['vendor.analytics']
    profile: typeof routes['vendor.profile']
  }
  api: {
    subscribeNewsletter: typeof routes['api.subscribe_newsletter']
    createReview: typeof routes['api.create_review']
    createAffiliateLink: typeof routes['api.create_affiliate_link']
    affiliateRedirect: typeof routes['api.affiliate_redirect']
    createOrder: typeof routes['api.create_order']
  }
}
