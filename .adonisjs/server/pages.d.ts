import '@adonisjs/inertia/types'

import type React from 'react'
import type { Prettify } from '@adonisjs/core/types/common'

type ExtractProps<T> =
  T extends React.FC<infer Props>
    ? Prettify<Omit<Props, 'children'>>
    : T extends React.Component<infer Props>
      ? Prettify<Omit<Props, 'children'>>
      : never

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'admin/AdminAnalytics': ExtractProps<(typeof import('../../inertia/pages/admin/AdminAnalytics.tsx'))['default']>
    'admin/AdminDashboard': ExtractProps<(typeof import('../../inertia/pages/admin/AdminDashboard.tsx'))['default']>
    'admin/AdminOrders': ExtractProps<(typeof import('../../inertia/pages/admin/AdminOrders.tsx'))['default']>
    'admin/AdminProducts': ExtractProps<(typeof import('../../inertia/pages/admin/AdminProducts.tsx'))['default']>
    'admin/AdminUsers': ExtractProps<(typeof import('../../inertia/pages/admin/AdminUsers.tsx'))['default']>
    'affiliate/AffiliateDashboard': ExtractProps<(typeof import('../../inertia/pages/affiliate/AffiliateDashboard.tsx'))['default']>
    'affiliate/AffiliateEarnings': ExtractProps<(typeof import('../../inertia/pages/affiliate/AffiliateEarnings.tsx'))['default']>
    'affiliate/AffiliateLinks': ExtractProps<(typeof import('../../inertia/pages/affiliate/AffiliateLinks.tsx'))['default']>
    'affiliate/AffiliatePerformance': ExtractProps<(typeof import('../../inertia/pages/affiliate/AffiliatePerformance.tsx'))['default']>
    'affiliate/AffiliateProducts': ExtractProps<(typeof import('../../inertia/pages/affiliate/AffiliateProducts.tsx'))['default']>
    'affiliate/AffiliateProfile': ExtractProps<(typeof import('../../inertia/pages/affiliate/AffiliateProfile.tsx'))['default']>
    'AffiliateRedirect': ExtractProps<(typeof import('../../inertia/pages/AffiliateRedirect.tsx'))['default']>
    'auth/forgot-password': ExtractProps<(typeof import('../../inertia/pages/auth/forgot-password.tsx'))['default']>
    'auth/login': ExtractProps<(typeof import('../../inertia/pages/auth/login.tsx'))['default']>
    'auth/reset-password': ExtractProps<(typeof import('../../inertia/pages/auth/reset-password.tsx'))['default']>
    'auth/signup': ExtractProps<(typeof import('../../inertia/pages/auth/signup.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'ForPartners': ExtractProps<(typeof import('../../inertia/pages/ForPartners.tsx'))['default']>
    'Home': ExtractProps<(typeof import('../../inertia/pages/Home.tsx'))['default']>
    'home': ExtractProps<(typeof import('../../inertia/pages/home.tsx'))['default']>
    'Marketplace': ExtractProps<(typeof import('../../inertia/pages/Marketplace.tsx'))['default']>
    'PrivacyPolicy': ExtractProps<(typeof import('../../inertia/pages/PrivacyPolicy.tsx'))['default']>
    'ProductDetail': ExtractProps<(typeof import('../../inertia/pages/ProductDetail.tsx'))['default']>
    'Reviews': ExtractProps<(typeof import('../../inertia/pages/Reviews.tsx'))['default']>
    'vendor/VendorAnalytics': ExtractProps<(typeof import('../../inertia/pages/vendor/VendorAnalytics.tsx'))['default']>
    'vendor/VendorDashboard': ExtractProps<(typeof import('../../inertia/pages/vendor/VendorDashboard.tsx'))['default']>
    'vendor/VendorEarnings': ExtractProps<(typeof import('../../inertia/pages/vendor/VendorEarnings.tsx'))['default']>
    'vendor/VendorProducts': ExtractProps<(typeof import('../../inertia/pages/vendor/VendorProducts.tsx'))['default']>
    'vendor/VendorProfile': ExtractProps<(typeof import('../../inertia/pages/vendor/VendorProfile.tsx'))['default']>
    'VendorKYC': ExtractProps<(typeof import('../../inertia/pages/VendorKYC.tsx'))['default']>
  }
}
