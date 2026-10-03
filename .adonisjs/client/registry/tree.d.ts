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
    campaigns: {
      discover: typeof routes['affiliate.campaigns.discover']
    }
    links: typeof routes['affiliate.links']
    earnings: typeof routes['affiliate.earnings']
    performance: typeof routes['affiliate.performance']
    profile: typeof routes['affiliate.profile']
  }
  for: {
    partners: typeof routes['for.partners']
  }
  privacy: typeof routes['privacy']
  track: {
    order: typeof routes['track.order']
  }
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
    disputes: typeof routes['admin.disputes']
    fraud: typeof routes['admin.fraud']
    getPlatformStats: typeof routes['admin.get_platform_stats']
    authStatus: typeof routes['admin.auth_status']
    debugPaystackBanks: typeof routes['admin.debug_paystack_banks']
    testEmail: typeof routes['admin.test_email']
    updateUser: typeof routes['admin.update_user']
    deleteUser: typeof routes['admin.delete_user']
  }
  vendor: {
    dashboard: typeof routes['vendor.dashboard']
    products: typeof routes['vendor.products']
    orders: typeof routes['vendor.orders'] & {
      update: typeof routes['vendor.orders.update']
    }
    kyc: typeof routes['vendor.kyc']
    earnings: typeof routes['vendor.earnings']
    analytics: typeof routes['vendor.analytics']
    profile: typeof routes['vendor.profile']
    integrations: typeof routes['vendor.integrations']
  }
  products: {
    index: typeof routes['products.index']
    show: typeof routes['products.show']
    store: typeof routes['products.store']
    update: typeof routes['products.update']
    destroy: typeof routes['products.destroy']
    approve: typeof routes['products.approve']
  }
  campaigns: {
    discover: typeof routes['campaigns.discover']
    show: typeof routes['campaigns.show']
    create: typeof routes['campaigns.create']
    update: typeof routes['campaigns.update']
    submit: typeof routes['campaigns.submit']
    pause: typeof routes['campaigns.pause']
    resume: typeof routes['campaigns.resume']
    vendorCampaigns: typeof routes['campaigns.vendor_campaigns']
    join: typeof routes['campaigns.join']
    affiliateCampaigns: typeof routes['campaigns.affiliate_campaigns']
    approve: typeof routes['campaigns.approve']
    reject: typeof routes['campaigns.reject']
  }
  shopify: {
    handleCallback: typeof routes['shopify.handle_callback']
    getAuthUrl: typeof routes['shopify.get_auth_url']
    getStore: typeof routes['shopify.get_store']
    disconnect: typeof routes['shopify.disconnect']
    syncProducts: typeof routes['shopify.sync_products']
    syncOrders: typeof routes['shopify.sync_orders']
    listProducts: typeof routes['shopify.list_products']
    updateProduct: typeof routes['shopify.update_product']
    listOrders: typeof routes['shopify.list_orders']
    getOrder: typeof routes['shopify.get_order']
    calculateCommissions: typeof routes['shopify.calculate_commissions']
    getAnalytics: typeof routes['shopify.get_analytics']
  }
  purchaseDestinations: {
    handleRedirect: typeof routes['purchase_destinations.handle_redirect']
    configureCampaignDestination: typeof routes['purchase_destinations.configure_campaign_destination']
    generateRedirectLink: typeof routes['purchase_destinations.generate_redirect_link']
    getStats: typeof routes['purchase_destinations.get_stats']
    recordConversion: typeof routes['purchase_destinations.record_conversion']
  }
  newsletters: {
    subscribe: typeof routes['newsletters.subscribe']
    unsubscribe: typeof routes['newsletters.unsubscribe']
  }
  affiliateLinks: {
    trackClick: typeof routes['affiliate_links.track_click']
    index: typeof routes['affiliate_links.index']
    create: typeof routes['affiliate_links.create']
    show: typeof routes['affiliate_links.show']
    update: typeof routes['affiliate_links.update']
    destroy: typeof routes['affiliate_links.destroy']
    metrics: typeof routes['affiliate_links.metrics']
    conversions: typeof routes['affiliate_links.conversions']
    trackClickSlug: typeof routes['affiliate_links.track_click_slug']
    reportConversion: typeof routes['affiliate_links.report_conversion']
  }
  currency: {
    listCurrencies: typeof routes['currency.list_currencies']
    getCurrency: typeof routes['currency.get_currency']
    convertCurrency: typeof routes['currency.convert_currency']
    getSupportedRegions: typeof routes['currency.get_supported_regions']
    getExchangeRateHistory: typeof routes['currency.get_exchange_rate_history']
    formatAmount: typeof routes['currency.format_amount']
    getRegionalPrice: typeof routes['currency.get_regional_price']
    setRegionalPricing: typeof routes['currency.set_regional_pricing']
    listProductPricing: typeof routes['currency.list_product_pricing']
    updateExchangeRates: typeof routes['currency.update_exchange_rates']
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
  orders: {
    trackOrder: typeof routes['orders.track_order']
    downloadDigitalAsset: typeof routes['orders.download_digital_asset']
    index: typeof routes['orders.index']
    show: typeof routes['orders.show']
    processOrder: typeof routes['orders.process_order']
    notifyVendor: typeof routes['orders.notify_vendor']
  }
  affiliates: {
    getTopPerformers: typeof routes['affiliates.get_top_performers']
    getAffiliatesByTier: typeof routes['affiliates.get_affiliates_by_tier']
    createCampaign: typeof routes['affiliates.create_campaign']
    listCampaigns: typeof routes['affiliates.list_campaigns']
    launchCampaign: typeof routes['affiliates.launch_campaign']
    completeCampaign: typeof routes['affiliates.complete_campaign']
    createProfile: typeof routes['affiliates.create_profile']
    getProfile: typeof routes['affiliates.get_profile']
    updateProfile: typeof routes['affiliates.update_profile']
    generateReferralCode: typeof routes['affiliates.generate_referral_code']
    getReferralCodes: typeof routes['affiliates.get_referral_codes']
    getReferralCodePerformance: typeof routes['affiliates.get_referral_code_performance']
    getReferrals: typeof routes['affiliates.get_referrals']
    getRewards: typeof routes['affiliates.get_rewards']
    claimReward: typeof routes['affiliates.claim_reward']
  }
  mobileApi: {
    getAppConfig: typeof routes['mobile_api.get_app_config']
    getDeviceInfo: typeof routes['mobile_api.get_device_info']
    healthCheck: typeof routes['mobile_api.health_check']
    getHelp: typeof routes['mobile_api.get_help']
    reportError: typeof routes['mobile_api.report_error']
    registerDevice: typeof routes['mobile_api.register_device']
    validateToken: typeof routes['mobile_api.validate_token']
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
  vendorConversions: {
    reportConversion: typeof routes['vendor_conversions.report_conversion']
    index: typeof routes['vendor_conversions.index']
    show: typeof routes['vendor_conversions.show']
    dispute: typeof routes['vendor_conversions.dispute']
    getStats: typeof routes['vendor_conversions.get_stats']
    approve: typeof routes['vendor_conversions.approve']
    reject: typeof routes['vendor_conversions.reject']
    reverse: typeof routes['vendor_conversions.reverse']
  }
  commissionLedger: {
    index: typeof routes['commission_ledger.index']
    show: typeof routes['commission_ledger.show']
    dispute: typeof routes['commission_ledger.dispute']
    getStats: typeof routes['commission_ledger.get_stats']
    campaignStats: typeof routes['commission_ledger.campaign_stats']
    approve: typeof routes['commission_ledger.approve']
    reject: typeof routes['commission_ledger.reject']
    markAsPaid: typeof routes['commission_ledger.mark_as_paid']
    bulkApprove: typeof routes['commission_ledger.bulk_approve']
  }
  refundsChargebacks: {
    report: typeof routes['refunds_chargebacks.report']
    index: typeof routes['refunds_chargebacks.index']
    show: typeof routes['refunds_chargebacks.show']
    getStats: typeof routes['refunds_chargebacks.get_stats']
    verify: typeof routes['refunds_chargebacks.verify']
    approve: typeof routes['refunds_chargebacks.approve']
    reject: typeof routes['refunds_chargebacks.reject']
    complete: typeof routes['refunds_chargebacks.complete']
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
  payouts: {
    wallet: typeof routes['payouts.wallet']
    requestPayout: typeof routes['payouts.request_payout']
    history: typeof routes['payouts.history']
    show: typeof routes['payouts.show']
    addPaymentMethod: typeof routes['payouts.add_payment_method']
    paymentMethods: typeof routes['payouts.payment_methods']
    adminIndex: typeof routes['payouts.admin_index']
    approve: typeof routes['payouts.approve']
    reject: typeof routes['payouts.reject']
    process: typeof routes['payouts.process']
    complete: typeof routes['payouts.complete']
    fail: typeof routes['payouts.fail']
  }
  notifications: {
    index: typeof routes['notifications.index']
    getUnreadCount: typeof routes['notifications.get_unread_count']
    show: typeof routes['notifications.show']
    markAsRead: typeof routes['notifications.mark_as_read']
    markAllAsRead: typeof routes['notifications.mark_all_as_read']
    destroy: typeof routes['notifications.destroy']
    destroyAll: typeof routes['notifications.destroy_all']
  }
  adminDashboard: {
    overview: typeof routes['admin_dashboard.overview']
    pendingCampaigns: typeof routes['admin_dashboard.pending_campaigns']
    recentConversions: typeof routes['admin_dashboard.recent_conversions']
    users: typeof routes['admin_dashboard.users']
    commissionStats: typeof routes['admin_dashboard.commission_stats']
    payoutStats: typeof routes['admin_dashboard.payout_stats']
    topCampaigns: typeof routes['admin_dashboard.top_campaigns']
    topAffiliates: typeof routes['admin_dashboard.top_affiliates']
    financialOverview: typeof routes['admin_dashboard.financial_overview']
    systemHealth: typeof routes['admin_dashboard.system_health']
    platformActivity: typeof routes['admin_dashboard.platform_activity']
  }
  adminFraud: {
    getFlagged: typeof routes['admin_fraud.get_flagged']
    approveConversion: typeof routes['admin_fraud.approve_conversion']
    rejectConversion: typeof routes['admin_fraud.reject_conversion']
    getStats: typeof routes['admin_fraud.get_stats']
    analyzeConversion: typeof routes['admin_fraud.analyze_conversion']
  }
  adminDispute: {
    getDisputes: typeof routes['admin_dispute.get_disputes']
    getDispute: typeof routes['admin_dispute.get_dispute']
    addEvidence: typeof routes['admin_dispute.add_evidence']
    escalateDispute: typeof routes['admin_dispute.escalate_dispute']
    resolveDispute: typeof routes['admin_dispute.resolve_dispute']
    getStats: typeof routes['admin_dispute.get_stats']
    autoResolve: typeof routes['admin_dispute.auto_resolve']
  }
  adminPayout: {
    getPayouts: typeof routes['admin_payout.get_payouts']
    checkStatus: typeof routes['admin_payout.check_status']
    getBanks: typeof routes['admin_payout.get_banks']
    verifyBankAccount: typeof routes['admin_payout.verify_bank_account']
    getStats: typeof routes['admin_payout.get_stats']
    handleWebhook: typeof routes['admin_payout.handle_webhook']
  }
  fraudAnalytics: {
    getStats: typeof routes['fraud_analytics.get_stats']
    listFlagged: typeof routes['fraud_analytics.list_flagged']
    getFraudDetails: typeof routes['fraud_analytics.get_fraud_details']
    approveFraudFlag: typeof routes['fraud_analytics.approve_fraud_flag']
    rejectFraudFlag: typeof routes['fraud_analytics.reject_fraud_flag']
    autoRejectHighRisk: typeof routes['fraud_analytics.auto_reject_high_risk']
    getTrends: typeof routes['fraud_analytics.get_trends']
    getTopFlags: typeof routes['fraud_analytics.get_top_flags']
  }
  analytics: {
    getMetrics: typeof routes['analytics.get_metrics']
    getSummary: typeof routes['analytics.get_summary']
    listCampaigns: typeof routes['analytics.list_campaigns']
    getCampaignMetrics: typeof routes['analytics.get_campaign_metrics']
    listAffiliates: typeof routes['analytics.list_affiliates']
    getAffiliateMetrics: typeof routes['analytics.get_affiliate_metrics']
    getCommissions: typeof routes['analytics.get_commissions']
    getCommissionSchedule: typeof routes['analytics.get_commission_schedule']
    exportConversions: typeof routes['analytics.export_conversions']
    exportCommissions: typeof routes['analytics.export_commissions']
  }
  influencers: {
    createProfile: typeof routes['influencers.create_profile']
    getProfile: typeof routes['influencers.get_profile']
    updateProfile: typeof routes['influencers.update_profile']
    getStats: typeof routes['influencers.get_stats']
    listCollaborations: typeof routes['influencers.list_collaborations']
    getCollaboration: typeof routes['influencers.get_collaboration']
    acceptCollaboration: typeof routes['influencers.accept_collaboration']
    createContent: typeof routes['influencers.create_content']
    listContent: typeof routes['influencers.list_content']
    getContentAnalytics: typeof routes['influencers.get_content_analytics']
    getContentPerformance: typeof routes['influencers.get_content_performance']
    updateContent: typeof routes['influencers.update_content']
    listInfluencers: typeof routes['influencers.list_influencers']
    viewInfluencer: typeof routes['influencers.view_influencer']
    verifyInfluencer: typeof routes['influencers.verify_influencer']
    rejectInfluencer: typeof routes['influencers.reject_influencer']
  }
  woocommerce: {
    connect: typeof routes['woocommerce.connect']
    getStore: typeof routes['woocommerce.get_store']
    disconnect: typeof routes['woocommerce.disconnect']
    syncProducts: typeof routes['woocommerce.sync_products']
    syncOrders: typeof routes['woocommerce.sync_orders']
    listProducts: typeof routes['woocommerce.list_products']
    updateProduct: typeof routes['woocommerce.update_product']
    listOrders: typeof routes['woocommerce.list_orders']
    calculateCommissions: typeof routes['woocommerce.calculate_commissions']
    getAnalytics: typeof routes['woocommerce.get_analytics']
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
  kyc: {
    listPendingSubmissions: typeof routes['kyc.list_pending_submissions']
    getStatistics: typeof routes['kyc.get_statistics']
    searchSubmissions: typeof routes['kyc.search_submissions']
    verifyDocument: typeof routes['kyc.verify_document']
    assessRisk: typeof routes['kyc.assess_risk']
    checkCompliance: typeof routes['kyc.check_compliance']
    approveSubmission: typeof routes['kyc.approve_submission']
    rejectSubmission: typeof routes['kyc.reject_submission']
    createSubmission: typeof routes['kyc.create_submission']
    uploadDocument: typeof routes['kyc.upload_document']
    getSubmission: typeof routes['kyc.get_submission']
    getAuditTrail: typeof routes['kyc.get_audit_trail']
  }
  reports: {
    createConfiguration: typeof routes['reports.create_configuration']
    listConfigurations: typeof routes['reports.list_configurations']
    getConfiguration: typeof routes['reports.get_configuration']
    updateConfiguration: typeof routes['reports.update_configuration']
    deleteConfiguration: typeof routes['reports.delete_configuration']
    generateReport: typeof routes['reports.generate_report']
    listReportLogs: typeof routes['reports.list_report_logs']
    getReportLog: typeof routes['reports.get_report_log']
    downloadReport: typeof routes['reports.download_report']
    createSchedule: typeof routes['reports.create_schedule']
    listSchedules: typeof routes['reports.list_schedules']
    updateSchedule: typeof routes['reports.update_schedule']
    deleteSchedule: typeof routes['reports.delete_schedule']
    archiveReport: typeof routes['reports.archive_report']
    getStats: typeof routes['reports.get_stats']
  }
  disputes: {
    listOpenDisputes: typeof routes['disputes.list_open_disputes']
    listEscalatedDisputes: typeof routes['disputes.list_escalated_disputes']
    filterDisputes: typeof routes['disputes.filter_disputes']
    getDashboardStats: typeof routes['disputes.get_dashboard_stats']
    updateStatus: typeof routes['disputes.update_status']
    resolveDispute: typeof routes['disputes.resolve_dispute']
    assignDispute: typeof routes['disputes.assign_dispute']
    escalateDispute: typeof routes['disputes.escalate_dispute']
    requestApproval: typeof routes['disputes.request_approval']
    approveDispute: typeof routes['disputes.approve_dispute']
    rejectDispute: typeof routes['disputes.reject_dispute']
    fileDispute: typeof routes['disputes.file_dispute']
    listUserDisputes: typeof routes['disputes.list_user_disputes']
    getDispute: typeof routes['disputes.get_dispute']
    getComments: typeof routes['disputes.get_comments']
    addComment: typeof routes['disputes.add_comment']
  }
  amazon: {
    getAuthUrl: typeof routes['amazon.get_auth_url']
    handleCallback: typeof routes['amazon.handle_callback']
    listAccounts: typeof routes['amazon.list_accounts']
    getCampaigns: typeof routes['amazon.get_campaigns']
  }
  etsy: {
    getAuthUrl: typeof routes['etsy.get_auth_url']
    handleCallback: typeof routes['etsy.handle_callback']
    listShops: typeof routes['etsy.list_shops']
    getListings: typeof routes['etsy.get_listings']
    getOrders: typeof routes['etsy.get_orders']
  }
  affiliateDashboard: {
    overview: typeof routes['affiliate_dashboard.overview']
    links: typeof routes['affiliate_dashboard.links']
    availableCampaigns: typeof routes['affiliate_dashboard.available_campaigns']
    commissions: typeof routes['affiliate_dashboard.commissions']
    payouts: typeof routes['affiliate_dashboard.payouts']
    earningsBreakdown: typeof routes['affiliate_dashboard.earnings_breakdown']
    trending: typeof routes['affiliate_dashboard.trending']
    trends: typeof routes['affiliate_dashboard.trends']
  }
  vendorDashboard: {
    overview: typeof routes['vendor_dashboard.overview']
    campaigns: typeof routes['vendor_dashboard.campaigns']
    topAffiliates: typeof routes['vendor_dashboard.top_affiliates']
    financials: typeof routes['vendor_dashboard.financials']
    activity: typeof routes['vendor_dashboard.activity']
    campaignDetails: typeof routes['vendor_dashboard.campaign_details']
    earningsBreakdown: typeof routes['vendor_dashboard.earnings_breakdown']
    trends: typeof routes['vendor_dashboard.trends']
  }
}
