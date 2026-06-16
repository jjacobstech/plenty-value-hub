/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
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
  'api.subscribe_newsletter': {
    methods: ["POST"],
    pattern: '/api/newsletters',
    tokens: [{"old":"/api/newsletters","type":0,"val":"api","end":""},{"old":"/api/newsletters","type":0,"val":"newsletters","end":""}],
    types: placeholder as Registry['api.subscribe_newsletter']['types'],
  },
  'api.create_review': {
    methods: ["POST"],
    pattern: '/api/reviews',
    tokens: [{"old":"/api/reviews","type":0,"val":"api","end":""},{"old":"/api/reviews","type":0,"val":"reviews","end":""}],
    types: placeholder as Registry['api.create_review']['types'],
  },
  'api.create_affiliate_link': {
    methods: ["POST"],
    pattern: '/api/affiliate-links',
    tokens: [{"old":"/api/affiliate-links","type":0,"val":"api","end":""},{"old":"/api/affiliate-links","type":0,"val":"affiliate-links","end":""}],
    types: placeholder as Registry['api.create_affiliate_link']['types'],
  },
  'api.affiliate_redirect': {
    methods: ["POST"],
    pattern: '/api/affiliate-redirect',
    tokens: [{"old":"/api/affiliate-redirect","type":0,"val":"api","end":""},{"old":"/api/affiliate-redirect","type":0,"val":"affiliate-redirect","end":""}],
    types: placeholder as Registry['api.affiliate_redirect']['types'],
  },
  'api.create_order': {
    methods: ["POST"],
    pattern: '/api/orders',
    tokens: [{"old":"/api/orders","type":0,"val":"api","end":""},{"old":"/api/orders","type":0,"val":"orders","end":""}],
    types: placeholder as Registry['api.create_order']['types'],
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
