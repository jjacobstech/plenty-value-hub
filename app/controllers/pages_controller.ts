import User from '#models/user'
import Product from '#models/product'
import Review from '#models/review'
import Order from '#models/order'
import AffiliateLink from '#models/affiliate_link'
import NewsletterSubscriber from '#models/newsletter_subscriber'
import db from '@adonisjs/lucid/services/db'
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
    const reviews = await Review.query()
      .where('status', 'approved')
      .orderBy('created_at', 'desc')
      .limit(50)
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
  async verifyEmail({ inertia, session, response }: HttpContext) {
    const email = session.get('pending_verification_email') as string | undefined
    if (!email) {
      return response.redirect('/auth/signup')
    }
    return inertia.render('auth/VerifyEmail', { email })
  }

  async forgotPassword({ inertia }: HttpContext) {
    return inertia.render('auth/forgot-password', {})
  }

  async resetPassword({ inertia }: HttpContext) {
    return inertia.render('auth/reset-password', {})
  }

  // Admin pages
  async adminDashboard({ inertia, auth }: HttpContext) {
    const [users, products, orders, subscriberCount] = await Promise.all([
      User.all(),
      Product.all(),
      Order.query().orderBy('created_at', 'desc').limit(500),
      NewsletterSubscriber.query().count('* as total').first(),
    ])
    return inertia.render('admin/AdminDashboard', {
      user: auth.user,
      users,
      products,
      orders,
      subscriberCount: Number((subscriberCount as any)?.$extras?.total ?? 0),
    })
  }

  async adminUsers({ inertia, auth }: HttpContext) {
    const users = await User.query().orderBy('created_at', 'desc').limit(200)
    return inertia.render('admin/AdminUsers', { user: auth.user, users })
  }

  async adminProducts({ inertia, auth }: HttpContext) {
    const products = await Product.query().orderBy('created_at', 'desc').limit(200)
    return inertia.render('admin/AdminProducts', { user: auth.user, products })
  }

  async adminOrders({ inertia, auth }: HttpContext) {
    const orders = await Order.query().orderBy('created_at', 'desc').limit(200)
    return inertia.render('admin/AdminOrders', { user: auth.user, orders })
  }

  async adminAnalytics({ inertia, auth }: HttpContext) {
    const [users, products, orders, links] = await Promise.all([
      User.all(),
      Product.all(),
      Order.query().orderBy('created_at', 'desc').limit(500),
      AffiliateLink.all(),
    ])
    return inertia.render('admin/AdminAnalytics', {
      user: auth.user,
      users,
      products,
      orders,
      links,
    })
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
      orders: vendorOrders,
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
    const orders = await Order.query()
      .join('products', 'orders.product_id', 'products.id')
      .where('products.vendor_id', auth.user!.id)
      .select('orders.*')
      .orderBy('orders.created_at', 'desc')
    return inertia.render('vendor/VendorEarnings', { user: auth.user, orders })
  }

  async vendorAnalytics({ inertia, auth }: HttpContext) {
    const orders = await Order.query()
      .join('products', 'orders.product_id', 'products.id')
      .where('products.vendor_id', auth.user!.id)
      .select('orders.*')
      .orderBy('orders.created_at', 'desc')
    const products = await Product.query().where('vendor_id', auth.user!.id)
    return inertia.render('vendor/VendorAnalytics', { user: auth.user, orders, products })
  }

  async vendorProfile({ inertia, auth }: HttpContext) {
    const user = await User.query().where('id', auth.user!.id).firstOrFail()
    return inertia.render('vendor/VendorProfile', { user: user.serialize() })
  }

  // Affiliate pages
  async affiliateDashboard({ inertia, auth }: HttpContext) {
    const links = await AffiliateLink.query().where('affiliate_id', auth.user!.id)
    const orders = await Order.query()
      .where('affiliate_id', auth.user!.id)
      .orderBy('created_at', 'desc')
    return inertia.render('affiliate/AffiliateDashboard', {
      user: auth.user,
      links,
      orders,
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
    const orders = await Order.query()
      .where('affiliate_id', auth.user!.id)
      .orderBy('created_at', 'desc')
    const links = await AffiliateLink.query().where('affiliate_id', auth.user!.id)
    return inertia.render('affiliate/AffiliateEarnings', { user: auth.user, orders, links })
  }

  async affiliatePerformance({ inertia, auth }: HttpContext) {
    const links = await AffiliateLink.query().where('affiliate_id', auth.user!.id)
    const performance = await Order.query()
      .where('affiliate_id', auth.user!.id)
      .select(db.raw('DATE(created_at) as date'))
      .count('* as count')
      .groupByRaw('DATE(created_at)')
      .orderBy('date', 'asc')
    return inertia.render('affiliate/AffiliatePerformance', { user: auth.user, links, performance })
  }

  async affiliateProfile({ inertia, auth }: HttpContext) {
    const user = await User.query().where('id', auth.user!.id).firstOrFail()
    return inertia.render('affiliate/AffiliateProfile', { user: user.serialize() })
  }
}
