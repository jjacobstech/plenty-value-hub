import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'home': { paramsTuple?: []; params?: {} }
    'marketplace': { paramsTuple?: []; params?: {} }
    'reviews': { paramsTuple?: []; params?: {} }
    'product.detail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate.redirect': { paramsTuple: [ParamValue]; params: {'link_code': ParamValue} }
    'for.partners': { paramsTuple?: []; params?: {} }
    'privacy': { paramsTuple?: []; params?: {} }
    'register': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
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
    'products.index': { paramsTuple?: []; params?: {} }
    'products.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'newsletters.subscribe': { paramsTuple?: []; params?: {} }
    'newsletters.unsubscribe': { paramsTuple?: []; params?: {} }
    'affiliate_links.track_click': { paramsTuple?: []; params?: {} }
    'reviews.index': { paramsTuple?: []; params?: {} }
    'products.store': { paramsTuple?: []; params?: {} }
    'products.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'products.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'orders.index': { paramsTuple?: []; params?: {} }
    'orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'orders.process_order': { paramsTuple?: []; params?: {} }
    'affiliate_links.index': { paramsTuple?: []; params?: {} }
    'affiliate_links.store': { paramsTuple?: []; params?: {} }
    'affiliate_links.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate_links.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reviews.store': { paramsTuple?: []; params?: {} }
    'profile.update_affiliate': { paramsTuple?: []; params?: {} }
    'profile.update_vendor': { paramsTuple?: []; params?: {} }
    'profile.upload_image': { paramsTuple?: []; params?: {} }
    'admin.get_platform_stats': { paramsTuple?: []; params?: {} }
    'products.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'orders.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.update_user': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reviews.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
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
    'products.index': { paramsTuple?: []; params?: {} }
    'products.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reviews.index': { paramsTuple?: []; params?: {} }
    'orders.index': { paramsTuple?: []; params?: {} }
    'orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate_links.index': { paramsTuple?: []; params?: {} }
    'admin.get_platform_stats': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
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
    'products.index': { paramsTuple?: []; params?: {} }
    'products.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reviews.index': { paramsTuple?: []; params?: {} }
    'orders.index': { paramsTuple?: []; params?: {} }
    'orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate_links.index': { paramsTuple?: []; params?: {} }
    'admin.get_platform_stats': { paramsTuple?: []; params?: {} }
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
    'products.store': { paramsTuple?: []; params?: {} }
    'orders.process_order': { paramsTuple?: []; params?: {} }
    'affiliate_links.store': { paramsTuple?: []; params?: {} }
    'reviews.store': { paramsTuple?: []; params?: {} }
    'profile.upload_image': { paramsTuple?: []; params?: {} }
    'reviews.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'products.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate_links.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'profile.update_affiliate': { paramsTuple?: []; params?: {} }
    'profile.update_vendor': { paramsTuple?: []; params?: {} }
    'products.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'orders.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.update_user': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'products.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'affiliate_links.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}