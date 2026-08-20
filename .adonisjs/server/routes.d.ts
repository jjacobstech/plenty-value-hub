import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'seo.sitemap': { paramsTuple?: []; params?: {} }
    'seo.robots': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'marketplace': { paramsTuple?: []; params?: {} }
    'reviews': { paramsTuple?: []; params?: {} }
    'product.detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate.redirect': { paramsTuple: [ParamValue]; params: {'link_code': ParamValue} }
    'for.partners': { paramsTuple?: []; params?: {} }
    'privacy': { paramsTuple?: []; params?: {} }
    'legacy.login': { paramsTuple?: []; params?: {} }
    'legacy.register': { paramsTuple?: []; params?: {} }
    'legacy.forgot.password': { paramsTuple?: []; params?: {} }
    'legacy.reset.password': { paramsTuple?: []; params?: {} }
    'legacy.verify.email': { paramsTuple?: []; params?: {} }
    'register': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'new_account.register_step_1': { paramsTuple?: []; params?: {} }
    'new_account.register_step_2': { paramsTuple?: []; params?: {} }
    'new_account.register_step_3': { paramsTuple?: []; params?: {} }
    'new_account.verify_otp': { paramsTuple?: []; params?: {} }
    'new_account.resend_otp': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'new_account.login': { paramsTuple?: []; params?: {} }
    'verify.email': { paramsTuple?: []; params?: {} }
    'forgot.password': { paramsTuple?: []; params?: {} }
    'new_account.forgot_password': { paramsTuple?: []; params?: {} }
    'reset.password': { paramsTuple?: []; params?: {} }
    'new_account.reset_password': { paramsTuple?: []; params?: {} }
    'google.redirect': { paramsTuple?: []; params?: {} }
    'google.callback': { paramsTuple?: []; params?: {} }
    'logout': { paramsTuple?: []; params?: {} }
    'admin.auth.login': { paramsTuple?: []; params?: {} }
    'admin.auth.setup.google': { paramsTuple?: []; params?: {} }
    'admin.auth.login.google': { paramsTuple?: []; params?: {} }
    'admin.auth.callback': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.users': { paramsTuple?: []; params?: {} }
    'admin.products': { paramsTuple?: []; params?: {} }
    'admin.orders': { paramsTuple?: []; params?: {} }
    'admin.analytics': { paramsTuple?: []; params?: {} }
    'admin.subscribers': { paramsTuple?: []; params?: {} }
    'admin.blog': { paramsTuple?: []; params?: {} }
    'admin.newsletters': { paramsTuple?: []; params?: {} }
    'admin.newsletter': { paramsTuple?: []; params?: {} }
    'admin.email.campaigns': { paramsTuple?: []; params?: {} }
    'admin.conversions': { paramsTuple?: []; params?: {} }
    'admin.hero.banner': { paramsTuple?: []; params?: {} }
    'admin.payment.settings': { paramsTuple?: []; params?: {} }
    'admin.payouts': { paramsTuple?: []; params?: {} }
    'vendor.dashboard': { paramsTuple?: []; params?: {} }
    'vendor.products': { paramsTuple?: []; params?: {} }
    'vendor.kyc': { paramsTuple?: []; params?: {} }
    'vendor.earnings': { paramsTuple?: []; params?: {} }
    'vendor.analytics': { paramsTuple?: []; params?: {} }
    'vendor.profile': { paramsTuple?: []; params?: {} }
    'affiliate.dashboard': { paramsTuple?: []; params?: {} }
    'affiliate.products': { paramsTuple?: []; params?: {} }
    'affiliate.links': { paramsTuple?: []; params?: {} }
    'affiliate.earnings': { paramsTuple?: []; params?: {} }
    'affiliate.performance': { paramsTuple?: []; params?: {} }
    'affiliate.profile': { paramsTuple?: []; params?: {} }
    'products.index': { paramsTuple?: []; params?: {} }
    'products.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'newsletters.subscribe': { paramsTuple?: []; params?: {} }
    'newsletters.unsubscribe': { paramsTuple?: []; params?: {} }
    'affiliate_links.track_click': { paramsTuple?: []; params?: {} }
    'reviews.index': { paramsTuple?: []; params?: {} }
    'site_settings.payment_config': { paramsTuple?: []; params?: {} }
    'payment.providers': { paramsTuple?: []; params?: {} }
    'payment.initialize': { paramsTuple?: []; params?: {} }
    'payment.verify': { paramsTuple?: []; params?: {} }
    'webhook.stripe_webhook': { paramsTuple?: []; params?: {} }
    'webhook.paystack_webhook': { paramsTuple?: []; params?: {} }
    'webhook.flutterwave_webhook': { paramsTuple?: []; params?: {} }
    'webhook.paypal_webhook': { paramsTuple?: []; params?: {} }
    'webhook.handle_webhook': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'products.store': { paramsTuple?: []; params?: {} }
    'products.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'products.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'orders.index': { paramsTuple?: []; params?: {} }
    'orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'orders.process_order': { paramsTuple?: []; params?: {} }
    'orders.notify_vendor': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate_links.index': { paramsTuple?: []; params?: {} }
    'affiliate_links.store': { paramsTuple?: []; params?: {} }
    'affiliate_links.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate_links.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reviews.store': { paramsTuple?: []; params?: {} }
    'profile.update_affiliate': { paramsTuple?: []; params?: {} }
    'profile.update_vendor': { paramsTuple?: []; params?: {} }
    'profile.upload_image': { paramsTuple?: []; params?: {} }
    'upload.upload_product_image': { paramsTuple?: []; params?: {} }
    'upload.upload_product_gallery': { paramsTuple?: []; params?: {} }
    'upload.upload_digital_asset': { paramsTuple?: []; params?: {} }
    'upload.upload_profile_image': { paramsTuple?: []; params?: {} }
    'upload.upload_admin_image': { paramsTuple?: []; params?: {} }
    'upload.upload_video': { paramsTuple?: []; params?: {} }
    'upload.upload_document': { paramsTuple?: []; params?: {} }
    'upload.upload_file': { paramsTuple?: []; params?: {} }
    'wallet.show': { paramsTuple?: []; params?: {} }
    'wallet.request_payout': { paramsTuple?: []; params?: {} }
    'admin.get_platform_stats': { paramsTuple?: []; params?: {} }
    'admin.auth_status': { paramsTuple?: []; params?: {} }
    'products.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'orders.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.update_user': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reviews.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'wallet.admin_index': { paramsTuple?: []; params?: {} }
    'wallet.admin_update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'blog_posts.index': { paramsTuple?: []; params?: {} }
    'blog_posts.store': { paramsTuple?: []; params?: {} }
    'blog_posts.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'blog_posts.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'newsletter_admin.index': { paramsTuple?: []; params?: {} }
    'newsletter_admin.store': { paramsTuple?: []; params?: {} }
    'newsletter_admin.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'newsletter_admin.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'email_campaigns.index': { paramsTuple?: []; params?: {} }
    'email_campaigns.store': { paramsTuple?: []; params?: {} }
    'email_campaigns.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'email_campaigns.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'site_settings.index': { paramsTuple?: []; params?: {} }
    'site_settings.upsert': { paramsTuple?: []; params?: {} }
    'site_settings.upload_image': { paramsTuple?: []; params?: {} }
    'site_settings.show': { paramsTuple: [ParamValue]; params: {'key': ParamValue} }
    'webhook.get_webhook_endpoints': { paramsTuple?: []; params?: {} }
    'webhook.test_webhook': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'payment_settings.index': { paramsTuple?: []; params?: {} }
    'payment_settings.status_list': { paramsTuple?: []; params?: {} }
    'payment_settings.store': { paramsTuple?: []; params?: {} }
    'payment_settings.show': { paramsTuple: [ParamValue]; params: {'gateway': ParamValue} }
    'payment_settings.update': { paramsTuple: [ParamValue]; params: {'gateway': ParamValue} }
    'payment_settings.toggle': { paramsTuple: [ParamValue]; params: {'gateway': ParamValue} }
    'payment_settings.destroy': { paramsTuple: [ParamValue]; params: {'gateway': ParamValue} }
  }
  GET: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'seo.sitemap': { paramsTuple?: []; params?: {} }
    'seo.robots': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'marketplace': { paramsTuple?: []; params?: {} }
    'reviews': { paramsTuple?: []; params?: {} }
    'product.detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate.redirect': { paramsTuple: [ParamValue]; params: {'link_code': ParamValue} }
    'for.partners': { paramsTuple?: []; params?: {} }
    'privacy': { paramsTuple?: []; params?: {} }
    'legacy.login': { paramsTuple?: []; params?: {} }
    'legacy.register': { paramsTuple?: []; params?: {} }
    'legacy.forgot.password': { paramsTuple?: []; params?: {} }
    'legacy.reset.password': { paramsTuple?: []; params?: {} }
    'legacy.verify.email': { paramsTuple?: []; params?: {} }
    'register': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'verify.email': { paramsTuple?: []; params?: {} }
    'forgot.password': { paramsTuple?: []; params?: {} }
    'reset.password': { paramsTuple?: []; params?: {} }
    'google.redirect': { paramsTuple?: []; params?: {} }
    'google.callback': { paramsTuple?: []; params?: {} }
    'admin.auth.login': { paramsTuple?: []; params?: {} }
    'admin.auth.setup.google': { paramsTuple?: []; params?: {} }
    'admin.auth.login.google': { paramsTuple?: []; params?: {} }
    'admin.auth.callback': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.users': { paramsTuple?: []; params?: {} }
    'admin.products': { paramsTuple?: []; params?: {} }
    'admin.orders': { paramsTuple?: []; params?: {} }
    'admin.analytics': { paramsTuple?: []; params?: {} }
    'admin.subscribers': { paramsTuple?: []; params?: {} }
    'admin.blog': { paramsTuple?: []; params?: {} }
    'admin.newsletters': { paramsTuple?: []; params?: {} }
    'admin.newsletter': { paramsTuple?: []; params?: {} }
    'admin.email.campaigns': { paramsTuple?: []; params?: {} }
    'admin.conversions': { paramsTuple?: []; params?: {} }
    'admin.hero.banner': { paramsTuple?: []; params?: {} }
    'admin.payment.settings': { paramsTuple?: []; params?: {} }
    'admin.payouts': { paramsTuple?: []; params?: {} }
    'vendor.dashboard': { paramsTuple?: []; params?: {} }
    'vendor.products': { paramsTuple?: []; params?: {} }
    'vendor.kyc': { paramsTuple?: []; params?: {} }
    'vendor.earnings': { paramsTuple?: []; params?: {} }
    'vendor.analytics': { paramsTuple?: []; params?: {} }
    'vendor.profile': { paramsTuple?: []; params?: {} }
    'affiliate.dashboard': { paramsTuple?: []; params?: {} }
    'affiliate.products': { paramsTuple?: []; params?: {} }
    'affiliate.links': { paramsTuple?: []; params?: {} }
    'affiliate.earnings': { paramsTuple?: []; params?: {} }
    'affiliate.performance': { paramsTuple?: []; params?: {} }
    'affiliate.profile': { paramsTuple?: []; params?: {} }
    'products.index': { paramsTuple?: []; params?: {} }
    'products.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reviews.index': { paramsTuple?: []; params?: {} }
    'site_settings.payment_config': { paramsTuple?: []; params?: {} }
    'payment.providers': { paramsTuple?: []; params?: {} }
    'orders.index': { paramsTuple?: []; params?: {} }
    'orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate_links.index': { paramsTuple?: []; params?: {} }
    'wallet.show': { paramsTuple?: []; params?: {} }
    'admin.get_platform_stats': { paramsTuple?: []; params?: {} }
    'admin.auth_status': { paramsTuple?: []; params?: {} }
    'wallet.admin_index': { paramsTuple?: []; params?: {} }
    'blog_posts.index': { paramsTuple?: []; params?: {} }
    'newsletter_admin.index': { paramsTuple?: []; params?: {} }
    'email_campaigns.index': { paramsTuple?: []; params?: {} }
    'site_settings.index': { paramsTuple?: []; params?: {} }
    'site_settings.show': { paramsTuple: [ParamValue]; params: {'key': ParamValue} }
    'webhook.get_webhook_endpoints': { paramsTuple?: []; params?: {} }
    'payment_settings.index': { paramsTuple?: []; params?: {} }
    'payment_settings.status_list': { paramsTuple?: []; params?: {} }
    'payment_settings.show': { paramsTuple: [ParamValue]; params: {'gateway': ParamValue} }
  }
  HEAD: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'seo.sitemap': { paramsTuple?: []; params?: {} }
    'seo.robots': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'marketplace': { paramsTuple?: []; params?: {} }
    'reviews': { paramsTuple?: []; params?: {} }
    'product.detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate.redirect': { paramsTuple: [ParamValue]; params: {'link_code': ParamValue} }
    'for.partners': { paramsTuple?: []; params?: {} }
    'privacy': { paramsTuple?: []; params?: {} }
    'legacy.login': { paramsTuple?: []; params?: {} }
    'legacy.register': { paramsTuple?: []; params?: {} }
    'legacy.forgot.password': { paramsTuple?: []; params?: {} }
    'legacy.reset.password': { paramsTuple?: []; params?: {} }
    'legacy.verify.email': { paramsTuple?: []; params?: {} }
    'register': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'verify.email': { paramsTuple?: []; params?: {} }
    'forgot.password': { paramsTuple?: []; params?: {} }
    'reset.password': { paramsTuple?: []; params?: {} }
    'google.redirect': { paramsTuple?: []; params?: {} }
    'google.callback': { paramsTuple?: []; params?: {} }
    'admin.auth.login': { paramsTuple?: []; params?: {} }
    'admin.auth.setup.google': { paramsTuple?: []; params?: {} }
    'admin.auth.login.google': { paramsTuple?: []; params?: {} }
    'admin.auth.callback': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.users': { paramsTuple?: []; params?: {} }
    'admin.products': { paramsTuple?: []; params?: {} }
    'admin.orders': { paramsTuple?: []; params?: {} }
    'admin.analytics': { paramsTuple?: []; params?: {} }
    'admin.subscribers': { paramsTuple?: []; params?: {} }
    'admin.blog': { paramsTuple?: []; params?: {} }
    'admin.newsletters': { paramsTuple?: []; params?: {} }
    'admin.newsletter': { paramsTuple?: []; params?: {} }
    'admin.email.campaigns': { paramsTuple?: []; params?: {} }
    'admin.conversions': { paramsTuple?: []; params?: {} }
    'admin.hero.banner': { paramsTuple?: []; params?: {} }
    'admin.payment.settings': { paramsTuple?: []; params?: {} }
    'admin.payouts': { paramsTuple?: []; params?: {} }
    'vendor.dashboard': { paramsTuple?: []; params?: {} }
    'vendor.products': { paramsTuple?: []; params?: {} }
    'vendor.kyc': { paramsTuple?: []; params?: {} }
    'vendor.earnings': { paramsTuple?: []; params?: {} }
    'vendor.analytics': { paramsTuple?: []; params?: {} }
    'vendor.profile': { paramsTuple?: []; params?: {} }
    'affiliate.dashboard': { paramsTuple?: []; params?: {} }
    'affiliate.products': { paramsTuple?: []; params?: {} }
    'affiliate.links': { paramsTuple?: []; params?: {} }
    'affiliate.earnings': { paramsTuple?: []; params?: {} }
    'affiliate.performance': { paramsTuple?: []; params?: {} }
    'affiliate.profile': { paramsTuple?: []; params?: {} }
    'products.index': { paramsTuple?: []; params?: {} }
    'products.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reviews.index': { paramsTuple?: []; params?: {} }
    'site_settings.payment_config': { paramsTuple?: []; params?: {} }
    'payment.providers': { paramsTuple?: []; params?: {} }
    'orders.index': { paramsTuple?: []; params?: {} }
    'orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate_links.index': { paramsTuple?: []; params?: {} }
    'wallet.show': { paramsTuple?: []; params?: {} }
    'admin.get_platform_stats': { paramsTuple?: []; params?: {} }
    'admin.auth_status': { paramsTuple?: []; params?: {} }
    'wallet.admin_index': { paramsTuple?: []; params?: {} }
    'blog_posts.index': { paramsTuple?: []; params?: {} }
    'newsletter_admin.index': { paramsTuple?: []; params?: {} }
    'email_campaigns.index': { paramsTuple?: []; params?: {} }
    'site_settings.index': { paramsTuple?: []; params?: {} }
    'site_settings.show': { paramsTuple: [ParamValue]; params: {'key': ParamValue} }
    'webhook.get_webhook_endpoints': { paramsTuple?: []; params?: {} }
    'payment_settings.index': { paramsTuple?: []; params?: {} }
    'payment_settings.status_list': { paramsTuple?: []; params?: {} }
    'payment_settings.show': { paramsTuple: [ParamValue]; params: {'gateway': ParamValue} }
  }
  POST: {
    'new_account.store': { paramsTuple?: []; params?: {} }
    'new_account.register_step_1': { paramsTuple?: []; params?: {} }
    'new_account.register_step_2': { paramsTuple?: []; params?: {} }
    'new_account.register_step_3': { paramsTuple?: []; params?: {} }
    'new_account.verify_otp': { paramsTuple?: []; params?: {} }
    'new_account.resend_otp': { paramsTuple?: []; params?: {} }
    'new_account.login': { paramsTuple?: []; params?: {} }
    'new_account.forgot_password': { paramsTuple?: []; params?: {} }
    'new_account.reset_password': { paramsTuple?: []; params?: {} }
    'logout': { paramsTuple?: []; params?: {} }
    'newsletters.subscribe': { paramsTuple?: []; params?: {} }
    'newsletters.unsubscribe': { paramsTuple?: []; params?: {} }
    'affiliate_links.track_click': { paramsTuple?: []; params?: {} }
    'payment.initialize': { paramsTuple?: []; params?: {} }
    'payment.verify': { paramsTuple?: []; params?: {} }
    'webhook.stripe_webhook': { paramsTuple?: []; params?: {} }
    'webhook.paystack_webhook': { paramsTuple?: []; params?: {} }
    'webhook.flutterwave_webhook': { paramsTuple?: []; params?: {} }
    'webhook.paypal_webhook': { paramsTuple?: []; params?: {} }
    'webhook.handle_webhook': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'products.store': { paramsTuple?: []; params?: {} }
    'orders.process_order': { paramsTuple?: []; params?: {} }
    'orders.notify_vendor': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate_links.store': { paramsTuple?: []; params?: {} }
    'reviews.store': { paramsTuple?: []; params?: {} }
    'profile.upload_image': { paramsTuple?: []; params?: {} }
    'upload.upload_product_image': { paramsTuple?: []; params?: {} }
    'upload.upload_product_gallery': { paramsTuple?: []; params?: {} }
    'upload.upload_digital_asset': { paramsTuple?: []; params?: {} }
    'upload.upload_profile_image': { paramsTuple?: []; params?: {} }
    'upload.upload_admin_image': { paramsTuple?: []; params?: {} }
    'upload.upload_video': { paramsTuple?: []; params?: {} }
    'upload.upload_document': { paramsTuple?: []; params?: {} }
    'upload.upload_file': { paramsTuple?: []; params?: {} }
    'wallet.request_payout': { paramsTuple?: []; params?: {} }
    'reviews.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'blog_posts.store': { paramsTuple?: []; params?: {} }
    'newsletter_admin.store': { paramsTuple?: []; params?: {} }
    'email_campaigns.store': { paramsTuple?: []; params?: {} }
    'site_settings.upsert': { paramsTuple?: []; params?: {} }
    'site_settings.upload_image': { paramsTuple?: []; params?: {} }
    'webhook.test_webhook': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'payment_settings.store': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'products.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate_links.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'profile.update_affiliate': { paramsTuple?: []; params?: {} }
    'profile.update_vendor': { paramsTuple?: []; params?: {} }
    'products.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'orders.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.update_user': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'wallet.admin_update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'blog_posts.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'newsletter_admin.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'email_campaigns.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payment_settings.update': { paramsTuple: [ParamValue]; params: {'gateway': ParamValue} }
  }
  DELETE: {
    'products.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate_links.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'blog_posts.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'newsletter_admin.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'email_campaigns.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payment_settings.destroy': { paramsTuple: [ParamValue]; params: {'gateway': ParamValue} }
  }
  PATCH: {
    'payment_settings.toggle': { paramsTuple: [ParamValue]; params: {'gateway': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}