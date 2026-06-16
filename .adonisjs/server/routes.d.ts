import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'marketplace': { paramsTuple?: []; params?: {} }
    'reviews': { paramsTuple?: []; params?: {} }
    'product.detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate.redirect': { paramsTuple: [ParamValue]; params: {'link_code': ParamValue} }
    'for.partners': { paramsTuple?: []; params?: {} }
    'privacy': { paramsTuple?: []; params?: {} }
    'register': { paramsTuple?: []; params?: {} }
    'new_account.register_step_1': { paramsTuple?: []; params?: {} }
    'new_account.register_step_2': { paramsTuple?: []; params?: {} }
    'new_account.register_step_3': { paramsTuple?: []; params?: {} }
    'new_account.verify_otp': { paramsTuple?: []; params?: {} }
    'new_account.resend_otp': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'new_account.login': { paramsTuple?: []; params?: {} }
    'forgot.password': { paramsTuple?: []; params?: {} }
    'new_account.forgot_password': { paramsTuple?: []; params?: {} }
    'reset.password': { paramsTuple?: []; params?: {} }
    'new_account.reset_password': { paramsTuple?: []; params?: {} }
    'google.redirect': { paramsTuple?: []; params?: {} }
    'google.callback': { paramsTuple?: []; params?: {} }
    'logout': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.users': { paramsTuple?: []; params?: {} }
    'admin.products': { paramsTuple?: []; params?: {} }
    'admin.orders': { paramsTuple?: []; params?: {} }
    'admin.analytics': { paramsTuple?: []; params?: {} }
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
    'api.subscribe_newsletter': { paramsTuple?: []; params?: {} }
    'api.create_review': { paramsTuple?: []; params?: {} }
    'api.create_affiliate_link': { paramsTuple?: []; params?: {} }
    'api.affiliate_redirect': { paramsTuple?: []; params?: {} }
    'api.create_order': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'marketplace': { paramsTuple?: []; params?: {} }
    'reviews': { paramsTuple?: []; params?: {} }
    'product.detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate.redirect': { paramsTuple: [ParamValue]; params: {'link_code': ParamValue} }
    'for.partners': { paramsTuple?: []; params?: {} }
    'privacy': { paramsTuple?: []; params?: {} }
    'register': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'forgot.password': { paramsTuple?: []; params?: {} }
    'reset.password': { paramsTuple?: []; params?: {} }
    'google.redirect': { paramsTuple?: []; params?: {} }
    'google.callback': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.users': { paramsTuple?: []; params?: {} }
    'admin.products': { paramsTuple?: []; params?: {} }
    'admin.orders': { paramsTuple?: []; params?: {} }
    'admin.analytics': { paramsTuple?: []; params?: {} }
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
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'marketplace': { paramsTuple?: []; params?: {} }
    'reviews': { paramsTuple?: []; params?: {} }
    'product.detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate.redirect': { paramsTuple: [ParamValue]; params: {'link_code': ParamValue} }
    'for.partners': { paramsTuple?: []; params?: {} }
    'privacy': { paramsTuple?: []; params?: {} }
    'register': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'forgot.password': { paramsTuple?: []; params?: {} }
    'reset.password': { paramsTuple?: []; params?: {} }
    'google.redirect': { paramsTuple?: []; params?: {} }
    'google.callback': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.users': { paramsTuple?: []; params?: {} }
    'admin.products': { paramsTuple?: []; params?: {} }
    'admin.orders': { paramsTuple?: []; params?: {} }
    'admin.analytics': { paramsTuple?: []; params?: {} }
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
  }
  POST: {
    'new_account.register_step_1': { paramsTuple?: []; params?: {} }
    'new_account.register_step_2': { paramsTuple?: []; params?: {} }
    'new_account.register_step_3': { paramsTuple?: []; params?: {} }
    'new_account.verify_otp': { paramsTuple?: []; params?: {} }
    'new_account.resend_otp': { paramsTuple?: []; params?: {} }
    'new_account.login': { paramsTuple?: []; params?: {} }
    'new_account.forgot_password': { paramsTuple?: []; params?: {} }
    'new_account.reset_password': { paramsTuple?: []; params?: {} }
    'logout': { paramsTuple?: []; params?: {} }
    'api.subscribe_newsletter': { paramsTuple?: []; params?: {} }
    'api.create_review': { paramsTuple?: []; params?: {} }
    'api.create_affiliate_link': { paramsTuple?: []; params?: {} }
    'api.affiliate_redirect': { paramsTuple?: []; params?: {} }
    'api.create_order': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}