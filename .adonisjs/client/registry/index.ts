/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'drive.fs.serve': {
    methods: ["GET","HEAD"],
    pattern: '/uploads/*',
    tokens: [{"old":"/uploads/*","type":0,"val":"uploads","end":""},{"old":"/uploads/*","type":2,"val":"*","end":""}],
    types: placeholder as Registry['drive.fs.serve']['types'],
  },
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'marketplace': {
    methods: ["GET","HEAD"],
    pattern: '/marketplace',
    tokens: [{"old":"/marketplace","type":0,"val":"marketplace","end":""}],
    types: placeholder as Registry['marketplace']['types'],
  },
  'reviews': {
    methods: ["GET","HEAD"],
    pattern: '/reviews',
    tokens: [{"old":"/reviews","type":0,"val":"reviews","end":""}],
    types: placeholder as Registry['reviews']['types'],
  },
  'product.detail': {
    methods: ["GET","HEAD"],
    pattern: '/product/:id',
    tokens: [{"old":"/product/:id","type":0,"val":"product","end":""},{"old":"/product/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['product.detail']['types'],
  },
  'affiliate.redirect': {
    methods: ["GET","HEAD"],
    pattern: '/ref/:link_code',
    tokens: [{"old":"/ref/:link_code","type":0,"val":"ref","end":""},{"old":"/ref/:link_code","type":1,"val":"link_code","end":""}],
    types: placeholder as Registry['affiliate.redirect']['types'],
  },
  'for.partners': {
    methods: ["GET","HEAD"],
    pattern: '/for-partners',
    tokens: [{"old":"/for-partners","type":0,"val":"for-partners","end":""}],
    types: placeholder as Registry['for.partners']['types'],
  },
  'privacy': {
    methods: ["GET","HEAD"],
    pattern: '/privacy',
    tokens: [{"old":"/privacy","type":0,"val":"privacy","end":""}],
    types: placeholder as Registry['privacy']['types'],
  },
  'register': {
    methods: ["GET","HEAD"],
    pattern: '/auth/signup',
    tokens: [{"old":"/auth/signup","type":0,"val":"auth","end":""},{"old":"/auth/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['register']['types'],
  },
  'new_account.store': {
    methods: ["POST"],
    pattern: '/auth/signup',
    tokens: [{"old":"/auth/signup","type":0,"val":"auth","end":""},{"old":"/auth/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.store']['types'],
  },
  'new_account.register_step_1': {
    methods: ["POST"],
    pattern: '/auth/signup/step1',
    tokens: [{"old":"/auth/signup/step1","type":0,"val":"auth","end":""},{"old":"/auth/signup/step1","type":0,"val":"signup","end":""},{"old":"/auth/signup/step1","type":0,"val":"step1","end":""}],
    types: placeholder as Registry['new_account.register_step_1']['types'],
  },
  'new_account.register_step_2': {
    methods: ["POST"],
    pattern: '/auth/signup/step2',
    tokens: [{"old":"/auth/signup/step2","type":0,"val":"auth","end":""},{"old":"/auth/signup/step2","type":0,"val":"signup","end":""},{"old":"/auth/signup/step2","type":0,"val":"step2","end":""}],
    types: placeholder as Registry['new_account.register_step_2']['types'],
  },
  'new_account.register_step_3': {
    methods: ["POST"],
    pattern: '/auth/signup/step3',
    tokens: [{"old":"/auth/signup/step3","type":0,"val":"auth","end":""},{"old":"/auth/signup/step3","type":0,"val":"signup","end":""},{"old":"/auth/signup/step3","type":0,"val":"step3","end":""}],
    types: placeholder as Registry['new_account.register_step_3']['types'],
  },
  'new_account.verify_otp': {
    methods: ["POST"],
    pattern: '/auth/signup/verify-otp',
    tokens: [{"old":"/auth/signup/verify-otp","type":0,"val":"auth","end":""},{"old":"/auth/signup/verify-otp","type":0,"val":"signup","end":""},{"old":"/auth/signup/verify-otp","type":0,"val":"verify-otp","end":""}],
    types: placeholder as Registry['new_account.verify_otp']['types'],
  },
  'new_account.resend_otp': {
    methods: ["POST"],
    pattern: '/auth/signup/resend-otp',
    tokens: [{"old":"/auth/signup/resend-otp","type":0,"val":"auth","end":""},{"old":"/auth/signup/resend-otp","type":0,"val":"signup","end":""},{"old":"/auth/signup/resend-otp","type":0,"val":"resend-otp","end":""}],
    types: placeholder as Registry['new_account.resend_otp']['types'],
  },
  'login': {
    methods: ["GET","HEAD"],
    pattern: '/auth/login',
    tokens: [{"old":"/auth/login","type":0,"val":"auth","end":""},{"old":"/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['login']['types'],
  },
  'new_account.login': {
    methods: ["POST"],
    pattern: '/auth/login',
    tokens: [{"old":"/auth/login","type":0,"val":"auth","end":""},{"old":"/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['new_account.login']['types'],
  },
  'forgot.password': {
    methods: ["GET","HEAD"],
    pattern: '/auth/forgot-password',
    tokens: [{"old":"/auth/forgot-password","type":0,"val":"auth","end":""},{"old":"/auth/forgot-password","type":0,"val":"forgot-password","end":""}],
    types: placeholder as Registry['forgot.password']['types'],
  },
  'new_account.forgot_password': {
    methods: ["POST"],
    pattern: '/auth/forgot-password',
    tokens: [{"old":"/auth/forgot-password","type":0,"val":"auth","end":""},{"old":"/auth/forgot-password","type":0,"val":"forgot-password","end":""}],
    types: placeholder as Registry['new_account.forgot_password']['types'],
  },
  'reset.password': {
    methods: ["GET","HEAD"],
    pattern: '/auth/reset-password',
    tokens: [{"old":"/auth/reset-password","type":0,"val":"auth","end":""},{"old":"/auth/reset-password","type":0,"val":"reset-password","end":""}],
    types: placeholder as Registry['reset.password']['types'],
  },
  'new_account.reset_password': {
    methods: ["POST"],
    pattern: '/auth/reset-password',
    tokens: [{"old":"/auth/reset-password","type":0,"val":"auth","end":""},{"old":"/auth/reset-password","type":0,"val":"reset-password","end":""}],
    types: placeholder as Registry['new_account.reset_password']['types'],
  },
  'google.redirect': {
    methods: ["GET","HEAD"],
    pattern: '/auth/google',
    tokens: [{"old":"/auth/google","type":0,"val":"auth","end":""},{"old":"/auth/google","type":0,"val":"google","end":""}],
    types: placeholder as Registry['google.redirect']['types'],
  },
  'google.callback': {
    methods: ["GET","HEAD"],
    pattern: '/auth/google/callback',
    tokens: [{"old":"/auth/google/callback","type":0,"val":"auth","end":""},{"old":"/auth/google/callback","type":0,"val":"google","end":""},{"old":"/auth/google/callback","type":0,"val":"callback","end":""}],
    types: placeholder as Registry['google.callback']['types'],
  },
  'logout': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['logout']['types'],
  },
  'admin.dashboard': {
    methods: ["GET","HEAD"],
    pattern: '/admin',
    tokens: [{"old":"/admin","type":0,"val":"admin","end":""}],
    types: placeholder as Registry['admin.dashboard']['types'],
  },
  'admin.users': {
    methods: ["GET","HEAD"],
    pattern: '/admin/users',
    tokens: [{"old":"/admin/users","type":0,"val":"admin","end":""},{"old":"/admin/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['admin.users']['types'],
  },
  'admin.products': {
    methods: ["GET","HEAD"],
    pattern: '/admin/products',
    tokens: [{"old":"/admin/products","type":0,"val":"admin","end":""},{"old":"/admin/products","type":0,"val":"products","end":""}],
    types: placeholder as Registry['admin.products']['types'],
  },
  'admin.orders': {
    methods: ["GET","HEAD"],
    pattern: '/admin/orders',
    tokens: [{"old":"/admin/orders","type":0,"val":"admin","end":""},{"old":"/admin/orders","type":0,"val":"orders","end":""}],
    types: placeholder as Registry['admin.orders']['types'],
  },
  'admin.analytics': {
    methods: ["GET","HEAD"],
    pattern: '/admin/analytics',
    tokens: [{"old":"/admin/analytics","type":0,"val":"admin","end":""},{"old":"/admin/analytics","type":0,"val":"analytics","end":""}],
    types: placeholder as Registry['admin.analytics']['types'],
  },
  'vendor.dashboard': {
    methods: ["GET","HEAD"],
    pattern: '/vendor',
    tokens: [{"old":"/vendor","type":0,"val":"vendor","end":""}],
    types: placeholder as Registry['vendor.dashboard']['types'],
  },
  'vendor.products': {
    methods: ["GET","HEAD"],
    pattern: '/vendor/products',
    tokens: [{"old":"/vendor/products","type":0,"val":"vendor","end":""},{"old":"/vendor/products","type":0,"val":"products","end":""}],
    types: placeholder as Registry['vendor.products']['types'],
  },
  'vendor.kyc': {
    methods: ["GET","HEAD"],
    pattern: '/vendor/kyc',
    tokens: [{"old":"/vendor/kyc","type":0,"val":"vendor","end":""},{"old":"/vendor/kyc","type":0,"val":"kyc","end":""}],
    types: placeholder as Registry['vendor.kyc']['types'],
  },
  'vendor.earnings': {
    methods: ["GET","HEAD"],
    pattern: '/vendor/earnings',
    tokens: [{"old":"/vendor/earnings","type":0,"val":"vendor","end":""},{"old":"/vendor/earnings","type":0,"val":"earnings","end":""}],
    types: placeholder as Registry['vendor.earnings']['types'],
  },
  'vendor.analytics': {
    methods: ["GET","HEAD"],
    pattern: '/vendor/analytics',
    tokens: [{"old":"/vendor/analytics","type":0,"val":"vendor","end":""},{"old":"/vendor/analytics","type":0,"val":"analytics","end":""}],
    types: placeholder as Registry['vendor.analytics']['types'],
  },
  'vendor.profile': {
    methods: ["GET","HEAD"],
    pattern: '/vendor/profile',
    tokens: [{"old":"/vendor/profile","type":0,"val":"vendor","end":""},{"old":"/vendor/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['vendor.profile']['types'],
  },
  'affiliate.dashboard': {
    methods: ["GET","HEAD"],
    pattern: '/affiliate',
    tokens: [{"old":"/affiliate","type":0,"val":"affiliate","end":""}],
    types: placeholder as Registry['affiliate.dashboard']['types'],
  },
  'affiliate.products': {
    methods: ["GET","HEAD"],
    pattern: '/affiliate/products',
    tokens: [{"old":"/affiliate/products","type":0,"val":"affiliate","end":""},{"old":"/affiliate/products","type":0,"val":"products","end":""}],
    types: placeholder as Registry['affiliate.products']['types'],
  },
  'affiliate.links': {
    methods: ["GET","HEAD"],
    pattern: '/affiliate/links',
    tokens: [{"old":"/affiliate/links","type":0,"val":"affiliate","end":""},{"old":"/affiliate/links","type":0,"val":"links","end":""}],
    types: placeholder as Registry['affiliate.links']['types'],
  },
  'affiliate.earnings': {
    methods: ["GET","HEAD"],
    pattern: '/affiliate/earnings',
    tokens: [{"old":"/affiliate/earnings","type":0,"val":"affiliate","end":""},{"old":"/affiliate/earnings","type":0,"val":"earnings","end":""}],
    types: placeholder as Registry['affiliate.earnings']['types'],
  },
  'affiliate.performance': {
    methods: ["GET","HEAD"],
    pattern: '/affiliate/performance',
    tokens: [{"old":"/affiliate/performance","type":0,"val":"affiliate","end":""},{"old":"/affiliate/performance","type":0,"val":"performance","end":""}],
    types: placeholder as Registry['affiliate.performance']['types'],
  },
  'affiliate.profile': {
    methods: ["GET","HEAD"],
    pattern: '/affiliate/profile',
    tokens: [{"old":"/affiliate/profile","type":0,"val":"affiliate","end":""},{"old":"/affiliate/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['affiliate.profile']['types'],
  },
  'products.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/products',
    tokens: [{"old":"/api/products","type":0,"val":"api","end":""},{"old":"/api/products","type":0,"val":"products","end":""}],
    types: placeholder as Registry['products.index']['types'],
  },
  'products.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/products/:id',
    tokens: [{"old":"/api/products/:id","type":0,"val":"api","end":""},{"old":"/api/products/:id","type":0,"val":"products","end":""},{"old":"/api/products/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['products.show']['types'],
  },
  'newsletters.subscribe': {
    methods: ["POST"],
    pattern: '/api/newsletters/subscribe',
    tokens: [{"old":"/api/newsletters/subscribe","type":0,"val":"api","end":""},{"old":"/api/newsletters/subscribe","type":0,"val":"newsletters","end":""},{"old":"/api/newsletters/subscribe","type":0,"val":"subscribe","end":""}],
    types: placeholder as Registry['newsletters.subscribe']['types'],
  },
  'newsletters.unsubscribe': {
    methods: ["POST"],
    pattern: '/api/newsletters/unsubscribe',
    tokens: [{"old":"/api/newsletters/unsubscribe","type":0,"val":"api","end":""},{"old":"/api/newsletters/unsubscribe","type":0,"val":"newsletters","end":""},{"old":"/api/newsletters/unsubscribe","type":0,"val":"unsubscribe","end":""}],
    types: placeholder as Registry['newsletters.unsubscribe']['types'],
  },
  'affiliate_links.track_click': {
    methods: ["POST"],
    pattern: '/api/affiliate-links/track-click',
    tokens: [{"old":"/api/affiliate-links/track-click","type":0,"val":"api","end":""},{"old":"/api/affiliate-links/track-click","type":0,"val":"affiliate-links","end":""},{"old":"/api/affiliate-links/track-click","type":0,"val":"track-click","end":""}],
    types: placeholder as Registry['affiliate_links.track_click']['types'],
  },
  'reviews.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/reviews',
    tokens: [{"old":"/api/reviews","type":0,"val":"api","end":""},{"old":"/api/reviews","type":0,"val":"reviews","end":""}],
    types: placeholder as Registry['reviews.index']['types'],
  },
  'products.store': {
    methods: ["POST"],
    pattern: '/api/products',
    tokens: [{"old":"/api/products","type":0,"val":"api","end":""},{"old":"/api/products","type":0,"val":"products","end":""}],
    types: placeholder as Registry['products.store']['types'],
  },
  'products.update': {
    methods: ["PUT"],
    pattern: '/api/products/:id',
    tokens: [{"old":"/api/products/:id","type":0,"val":"api","end":""},{"old":"/api/products/:id","type":0,"val":"products","end":""},{"old":"/api/products/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['products.update']['types'],
  },
  'products.destroy': {
    methods: ["DELETE"],
    pattern: '/api/products/:id',
    tokens: [{"old":"/api/products/:id","type":0,"val":"api","end":""},{"old":"/api/products/:id","type":0,"val":"products","end":""},{"old":"/api/products/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['products.destroy']['types'],
  },
  'orders.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/orders',
    tokens: [{"old":"/api/orders","type":0,"val":"api","end":""},{"old":"/api/orders","type":0,"val":"orders","end":""}],
    types: placeholder as Registry['orders.index']['types'],
  },
  'orders.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/orders/:id',
    tokens: [{"old":"/api/orders/:id","type":0,"val":"api","end":""},{"old":"/api/orders/:id","type":0,"val":"orders","end":""},{"old":"/api/orders/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['orders.show']['types'],
  },
  'orders.process_order': {
    methods: ["POST"],
    pattern: '/api/orders',
    tokens: [{"old":"/api/orders","type":0,"val":"api","end":""},{"old":"/api/orders","type":0,"val":"orders","end":""}],
    types: placeholder as Registry['orders.process_order']['types'],
  },
  'affiliate_links.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/affiliate-links',
    tokens: [{"old":"/api/affiliate-links","type":0,"val":"api","end":""},{"old":"/api/affiliate-links","type":0,"val":"affiliate-links","end":""}],
    types: placeholder as Registry['affiliate_links.index']['types'],
  },
  'affiliate_links.store': {
    methods: ["POST"],
    pattern: '/api/affiliate-links',
    tokens: [{"old":"/api/affiliate-links","type":0,"val":"api","end":""},{"old":"/api/affiliate-links","type":0,"val":"affiliate-links","end":""}],
    types: placeholder as Registry['affiliate_links.store']['types'],
  },
  'affiliate_links.update': {
    methods: ["PUT"],
    pattern: '/api/affiliate-links/:id',
    tokens: [{"old":"/api/affiliate-links/:id","type":0,"val":"api","end":""},{"old":"/api/affiliate-links/:id","type":0,"val":"affiliate-links","end":""},{"old":"/api/affiliate-links/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['affiliate_links.update']['types'],
  },
  'affiliate_links.destroy': {
    methods: ["DELETE"],
    pattern: '/api/affiliate-links/:id',
    tokens: [{"old":"/api/affiliate-links/:id","type":0,"val":"api","end":""},{"old":"/api/affiliate-links/:id","type":0,"val":"affiliate-links","end":""},{"old":"/api/affiliate-links/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['affiliate_links.destroy']['types'],
  },
  'reviews.store': {
    methods: ["POST"],
    pattern: '/api/reviews',
    tokens: [{"old":"/api/reviews","type":0,"val":"api","end":""},{"old":"/api/reviews","type":0,"val":"reviews","end":""}],
    types: placeholder as Registry['reviews.store']['types'],
  },
  'profile.update_affiliate': {
    methods: ["PUT"],
    pattern: '/api/profile/affiliate',
    tokens: [{"old":"/api/profile/affiliate","type":0,"val":"api","end":""},{"old":"/api/profile/affiliate","type":0,"val":"profile","end":""},{"old":"/api/profile/affiliate","type":0,"val":"affiliate","end":""}],
    types: placeholder as Registry['profile.update_affiliate']['types'],
  },
  'profile.update_vendor': {
    methods: ["PUT"],
    pattern: '/api/profile/vendor',
    tokens: [{"old":"/api/profile/vendor","type":0,"val":"api","end":""},{"old":"/api/profile/vendor","type":0,"val":"profile","end":""},{"old":"/api/profile/vendor","type":0,"val":"vendor","end":""}],
    types: placeholder as Registry['profile.update_vendor']['types'],
  },
  'profile.upload_image': {
    methods: ["POST"],
    pattern: '/api/profile/upload-image',
    tokens: [{"old":"/api/profile/upload-image","type":0,"val":"api","end":""},{"old":"/api/profile/upload-image","type":0,"val":"profile","end":""},{"old":"/api/profile/upload-image","type":0,"val":"upload-image","end":""}],
    types: placeholder as Registry['profile.upload_image']['types'],
  },
  'admin.get_platform_stats': {
    methods: ["GET","HEAD"],
    pattern: '/api/stats',
    tokens: [{"old":"/api/stats","type":0,"val":"api","end":""},{"old":"/api/stats","type":0,"val":"stats","end":""}],
    types: placeholder as Registry['admin.get_platform_stats']['types'],
  },
  'products.approve': {
    methods: ["PUT"],
    pattern: '/api/products/:id/approve',
    tokens: [{"old":"/api/products/:id/approve","type":0,"val":"api","end":""},{"old":"/api/products/:id/approve","type":0,"val":"products","end":""},{"old":"/api/products/:id/approve","type":1,"val":"id","end":""},{"old":"/api/products/:id/approve","type":0,"val":"approve","end":""}],
    types: placeholder as Registry['products.approve']['types'],
  },
  'orders.update_status': {
    methods: ["PUT"],
    pattern: '/api/orders/:id',
    tokens: [{"old":"/api/orders/:id","type":0,"val":"api","end":""},{"old":"/api/orders/:id","type":0,"val":"orders","end":""},{"old":"/api/orders/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['orders.update_status']['types'],
  },
  'admin.update_user': {
    methods: ["PUT"],
    pattern: '/api/users/:id',
    tokens: [{"old":"/api/users/:id","type":0,"val":"api","end":""},{"old":"/api/users/:id","type":0,"val":"users","end":""},{"old":"/api/users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.update_user']['types'],
  },
  'reviews.approve': {
    methods: ["POST"],
    pattern: '/api/reviews/:id/approve',
    tokens: [{"old":"/api/reviews/:id/approve","type":0,"val":"api","end":""},{"old":"/api/reviews/:id/approve","type":0,"val":"reviews","end":""},{"old":"/api/reviews/:id/approve","type":1,"val":"id","end":""},{"old":"/api/reviews/:id/approve","type":0,"val":"approve","end":""}],
    types: placeholder as Registry['reviews.approve']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
