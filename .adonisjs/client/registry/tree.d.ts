/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  drive: {
    fs: {
      serve: typeof routes['drive.fs.serve']
    }
  }
  home: typeof routes['home']
  marketplace: typeof routes['marketplace']
  reviews: typeof routes['reviews'] & {
    index: typeof routes['reviews.index']
    store: typeof routes['reviews.store']
    approve: typeof routes['reviews.approve']
  }
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
    store: typeof routes['new_account.store']
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
    getPlatformStats: typeof routes['admin.get_platform_stats']
    updateUser: typeof routes['admin.update_user']
  }
  vendor: {
    dashboard: typeof routes['vendor.dashboard']
    products: typeof routes['vendor.products']
    kyc: typeof routes['vendor.kyc']
    earnings: typeof routes['vendor.earnings']
    analytics: typeof routes['vendor.analytics']
    profile: typeof routes['vendor.profile']
  }
  products: {
    index: typeof routes['products.index']
    show: typeof routes['products.show']
    store: typeof routes['products.store']
    update: typeof routes['products.update']
    destroy: typeof routes['products.destroy']
    approve: typeof routes['products.approve']
  }
  newsletters: {
    subscribe: typeof routes['newsletters.subscribe']
    unsubscribe: typeof routes['newsletters.unsubscribe']
  }
  affiliateLinks: {
    trackClick: typeof routes['affiliate_links.track_click']
    index: typeof routes['affiliate_links.index']
    store: typeof routes['affiliate_links.store']
    update: typeof routes['affiliate_links.update']
    destroy: typeof routes['affiliate_links.destroy']
  }
  orders: {
    index: typeof routes['orders.index']
    show: typeof routes['orders.show']
    processOrder: typeof routes['orders.process_order']
    updateStatus: typeof routes['orders.update_status']
  }
  profile: {
    updateAffiliate: typeof routes['profile.update_affiliate']
    updateVendor: typeof routes['profile.update_vendor']
    uploadImage: typeof routes['profile.upload_image']
  }
}
