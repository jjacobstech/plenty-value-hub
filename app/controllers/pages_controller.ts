import User from '#models/user'
import Product from '#models/product'
import Review from '#models/review'
import Order from '#models/order'
import AffiliateLink from '#models/affiliate_link'
import NewsletterSubscriber from '#models/newsletter_subscriber'
import type { HttpContext } from '@adonisjs/core/http'

export default class PagesController {
  // Public pages - Home
  async home({ inertia }: HttpContext) {
    const featuredProducts = await Product.query()
      .where('status', 'approved')
      .where('is_featured', true)
      .orderBy('created_at', 'desc')
      .limit(8)

    const trendingProducts = await Product.query()
      .where('status', 'approved')
      .orderBy('gravity_score', 'desc')
      .limit(4)

    return inertia.render('Home', { featuredProducts, trendingProducts })
  }

  async marketplace({ inertia }: HttpContext) {
    const products = await Product.query().where('status', 'approved').limit(100)
    return inertia.render('Marketplace', { products })
  }

  async reviews({ inertia }: HttpContext) {
    const reviews = await Review.query().where('status', 'approved').orderBy('created_at', 'desc').limit(50)
    return inertia.render('Reviews', { reviews })
  }

  async productDetail({ inertia, params }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    const reviews = await Review.query().where('product_id', params.id)
    return inertia.render('ProductDetail', { product, reviews })
  }

  async affiliateRedirect({ inertia, params }: HttpContext) {
    return inertia.render('AffiliateRedirect', { link_code: params.link_code })
  }

  async forPartners({ inertia }: HttpContext) {
    return inertia.render('ForPartners', {})
  }

  async privacyPolicy({ inertia }: HttpContext) {
    return inertia.render('PrivacyPolicy', {})
  }

  // Auth pages
  async forgotPassword({ inertia }: HttpContext) {
    return inertia.render('auth/forgot-password', {})
  }

  async resetPassword({ inertia }: HttpContext) {
    return inertia.render('auth/reset-password', {})
  }

  // Admin pages
  async adminDashboard({ inertia, auth }: HttpContext) {
    const userCount = await User.query().count('*', 'total')
    const productCount = await Product.query().count('*', 'total')
    const orderCount = await Order.query().count('*', 'total')
    return inertia.render('admin/AdminDashboard', {
      user: auth.user,
      stats: { users: userCount, products: productCount, orders: orderCount }
    })
  }

  async adminUsers({ inertia, auth }: HttpContext) {
    const users = await User.query().select('*').paginate(1, 20)
    return inertia.render('admin/AdminUsers', { user: auth.user, users })
  }

  async adminProducts({ inertia, auth }: HttpContext) {
    const products = await Product.query().paginate(1, 20)
    return inertia.render('admin/AdminProducts', { user: auth.user, products })
  }

  async adminOrders({ inertia, auth }: HttpContext) {
    const orders = await Order.query().paginate(1, 20)
    return inertia.render('admin/AdminOrders', { user: auth.user, orders })
  }

  async adminAnalytics({ inertia, auth }: HttpContext) {
    const totalRevenue = await Order.query().sum('total as total')
    const totalOrders = await Order.query().count('*', 'total')
    return inertia.render('admin/AdminAnalytics', { user: auth.user, analytics: { totalRevenue, totalOrders } })
  }

  // Vendor pages
  async vendorDashboard({ inertia, auth }: HttpContext) {
    const vendorProducts = await Product.query().where('vendor_id', auth.user!.id)
    const vendorOrders = await Order.query()
      .join('products', 'orders.product_id', 'products.id')
      .where('products.vendor_id', auth.user!.id)
    return inertia.render('vendor/VendorDashboard', {
      user: auth.user,
      products: vendorProducts,
      orders: vendorOrders
    })
  }

  async vendorProducts({ inertia, auth }: HttpContext) {
    const products = await Product.query().where('vendor_id', auth.user!.id)
    return inertia.render('vendor/VendorProducts', { user: auth.user, products })
  }

  async vendorKYC({ inertia, auth }: HttpContext) {
    return inertia.render('VendorKYC', { user: auth.user })
  }

  async vendorEarnings({ inertia, auth }: HttpContext) {
    const earnings = await Order.query()
      .join('products', 'orders.product_id', 'products.id')
      .where('products.vendor_id', auth.user!.id)
      .sum('orders.vendor_commission as total_earnings')
    return inertia.render('vendor/VendorEarnings', { user: auth.user, earnings })
  }

  async vendorAnalytics({ inertia, auth }: HttpContext) {
    const analytics = await Order.query()
      .join('products', 'orders.product_id', 'products.id')
      .where('products.vendor_id', auth.user!.id)
      .select('orders.created_at')
      .count('*', 'count')
    return inertia.render('vendor/VendorAnalytics', { user: auth.user, analytics })
  }

  async vendorProfile({ inertia, auth }: HttpContext) {
    return inertia.render('vendor/VendorProfile', { user: auth.user })
  }

  // Affiliate pages
  async affiliateDashboard({ inertia, auth }: HttpContext) {
    const links = await AffiliateLink.query().where('affiliate_id', auth.user!.id)
    const earnings = await Order.query()
      .where('affiliate_id', auth.user!.id)
      .sum('affiliate_commission as total_earnings')
    return inertia.render('affiliate/AffiliateDashboard', {
      user: auth.user,
      links,
      earnings
    })
  }

  async affiliateProducts({ inertia, auth }: HttpContext) {
    const products = await Product.query().where('status', 'approved').limit(50)
    return inertia.render('affiliate/AffiliateProducts', { user: auth.user, products })
  }

  async affiliateLinks({ inertia, auth }: HttpContext) {
    const links = await AffiliateLink.query().where('affiliate_id', auth.user!.id)
    return inertia.render('affiliate/AffiliateLinks', { user: auth.user, links })
  }

  async affiliateEarnings({ inertia, auth }: HttpContext) {
    const earnings = await Order.query()
      .where('affiliate_id', auth.user!.id)
      .sum('affiliate_commission as total_earnings')
    return inertia.render('affiliate/AffiliateEarnings', { user: auth.user, earnings })
  }

  async affiliatePerformance({ inertia, auth }: HttpContext) {
    const performance = await Order.query()
      .where('affiliate_id', auth.user!.id)
      .select('created_at')
      .count('*', 'count')
    return inertia.render('affiliate/AffiliatePerformance', { user: auth.user, performance })
  }

  async affiliateProfile({ inertia, auth }: HttpContext) {
    return inertia.render('affiliate/AffiliateProfile', { user: auth.user })
  }
}
