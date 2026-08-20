/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  drive: {
    fs: {
      serve: typeof routes['drive.fs.serve']
    }
  }
  seo: {
    sitemap: typeof routes['seo.sitemap']
    robots: typeof routes['seo.robots']
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
  legacy: {
    login: typeof routes['legacy.login']
    register: typeof routes['legacy.register']
    forgot: {
      password: typeof routes['legacy.forgot.password']
    }
    reset: {
      password: typeof routes['legacy.reset.password']
    }
    verify: {
      email: typeof routes['legacy.verify.email']
    }
  }
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
  verify: {
    email: typeof routes['verify.email']
  }
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
    auth: {
      login: typeof routes['admin.auth.login'] & {
        google: typeof routes['admin.auth.login.google']
      }
      setup: {
        google: typeof routes['admin.auth.setup.google']
      }
      callback: typeof routes['admin.auth.callback']
    }
    dashboard: typeof routes['admin.dashboard']
    users: typeof routes['admin.users']
    products: typeof routes['admin.products']
    orders: typeof routes['admin.orders']
    analytics: typeof routes['admin.analytics']
    subscribers: typeof routes['admin.subscribers']
    blog: typeof routes['admin.blog']
    newsletters: typeof routes['admin.newsletters']
    newsletter: typeof routes['admin.newsletter']
    email: {
      campaigns: typeof routes['admin.email.campaigns']
    }
    conversions: typeof routes['admin.conversions']
    hero: {
      banner: typeof routes['admin.hero.banner']
    }
    payment: {
      settings: typeof routes['admin.payment.settings']
    }
    payouts: typeof routes['admin.payouts']
    getPlatformStats: typeof routes['admin.get_platform_stats']
    authStatus: typeof routes['admin.auth_status']
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
  siteSettings: {
    paymentConfig: typeof routes['site_settings.payment_config']
    index: typeof routes['site_settings.index']
    upsert: typeof routes['site_settings.upsert']
    uploadImage: typeof routes['site_settings.upload_image']
    show: typeof routes['site_settings.show']
  }
  payment: {
    providers: typeof routes['payment.providers']
    initialize: typeof routes['payment.initialize']
    verify: typeof routes['payment.verify']
  }
  webhook: {
    stripeWebhook: typeof routes['webhook.stripe_webhook']
    paystackWebhook: typeof routes['webhook.paystack_webhook']
    flutterwaveWebhook: typeof routes['webhook.flutterwave_webhook']
    paypalWebhook: typeof routes['webhook.paypal_webhook']
    handleWebhook: typeof routes['webhook.handle_webhook']
    getWebhookEndpoints: typeof routes['webhook.get_webhook_endpoints']
    testWebhook: typeof routes['webhook.test_webhook']
  }
  orders: {
    index: typeof routes['orders.index']
    show: typeof routes['orders.show']
    processOrder: typeof routes['orders.process_order']
    notifyVendor: typeof routes['orders.notify_vendor']
    updateStatus: typeof routes['orders.update_status']
  }
  profile: {
    updateAffiliate: typeof routes['profile.update_affiliate']
    updateVendor: typeof routes['profile.update_vendor']
    uploadImage: typeof routes['profile.upload_image']
  }
  upload: {
    uploadProductImage: typeof routes['upload.upload_product_image']
    uploadProductGallery: typeof routes['upload.upload_product_gallery']
    uploadDigitalAsset: typeof routes['upload.upload_digital_asset']
    uploadProfileImage: typeof routes['upload.upload_profile_image']
    uploadAdminImage: typeof routes['upload.upload_admin_image']
    uploadVideo: typeof routes['upload.upload_video']
    uploadDocument: typeof routes['upload.upload_document']
    uploadFile: typeof routes['upload.upload_file']
  }
  wallet: {
    show: typeof routes['wallet.show']
    requestPayout: typeof routes['wallet.request_payout']
    adminIndex: typeof routes['wallet.admin_index']
    adminUpdate: typeof routes['wallet.admin_update']
  }
  blogPosts: {
    index: typeof routes['blog_posts.index']
    store: typeof routes['blog_posts.store']
    update: typeof routes['blog_posts.update']
    destroy: typeof routes['blog_posts.destroy']
  }
  newsletterAdmin: {
    index: typeof routes['newsletter_admin.index']
    store: typeof routes['newsletter_admin.store']
    update: typeof routes['newsletter_admin.update']
    destroy: typeof routes['newsletter_admin.destroy']
  }
  emailCampaigns: {
    index: typeof routes['email_campaigns.index']
    store: typeof routes['email_campaigns.store']
    update: typeof routes['email_campaigns.update']
    destroy: typeof routes['email_campaigns.destroy']
  }
  paymentSettings: {
    index: typeof routes['payment_settings.index']
    statusList: typeof routes['payment_settings.status_list']
    store: typeof routes['payment_settings.store']
    show: typeof routes['payment_settings.show']
    update: typeof routes['payment_settings.update']
    toggle: typeof routes['payment_settings.toggle']
    destroy: typeof routes['payment_settings.destroy']
  }
}
