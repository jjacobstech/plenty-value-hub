import User from '#models/user'
import Product from '#models/product'
import Review from '#models/review'
import Order from '#models/order'
import AffiliateLink from '#models/affiliate_link'
import NewsletterSubscriber from '#models/newsletter_subscriber'
import BlogPost from '#models/blog_post'
import Newsletter from '#models/newsletter'
import EmailCampaign from '#models/email_campaign'
import SiteSetting from '#models/site_setting'
import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'
import { PaymentService } from '#services/payment_service'
import env from '#start/env'
/**
 * Offline payment is being retired. Filter it here so the page can never
 * offer a provider that won't actually take money, even if a stale
 * SiteSetting row still lists it.
 */
const RETIRED_PROVIDERS = new Set(['manual'])

/** Postgres returns decimal/numeric columns as strings — coerce once, here. */
function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

/** Same, but preserves "no value" as null so 0 stays meaningful. */
function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

/**
 * Stored image URLs may be absolute with a baked-in host (e.g. localhost from
 * a dev upload). Keep only the path and re-host it on the current origin so
 * links survive a deploy.
 */
function resolveAssetUrl(raw: unknown, origin: string): string | null {
  if (!raw) return null
  const value = String(raw).trim()
  if (!value) return null
  if (value.startsWith('data:')) return value

  try {
    const parsed = new URL(value)
    return `${origin}${parsed.pathname}${parsed.search}`
  } catch {
    return `${origin}/${value.replace(/^\/+/, '')}`
  }
}



export default class PagesController {
  // Public pages - Home
  async home({ inertia }: HttpContext) {
    const [featuredProducts, trendingProducts, heroBanner] = await Promise.all([
      Product.query()
        .where('status', 'approved')
        .where('is_featured', true)
        .orderBy('created_at', 'desc')
        .limit(8),
      Product.query().where('status', 'approved').orderBy('gravity_score', 'desc').limit(4),
      SiteSetting.findBy('key', 'hero_banner'),
    ])

    return inertia.render('Home', {
      featuredProducts,
      trendingProducts,
      heroBannerImage: heroBanner?.value || '/hero-banner.png',
    })
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

  async productDetail({ inertia, request, params }: HttpContext) {
    const origin =
      env.get('APP_URL') ?? `${request.protocol()}://${request.host() ?? 'localhost:3000'}`

    const [productRow, reviewRows, paymentConfig] = await Promise.all([
      // Only approved products are publicly visible — a pending or rejected
      // listing should 404 rather than render.
      Product.query().where('id', params.id).where('status', 'approved').firstOrFail(),

      // NOTE: adjust the column/relation names below to match your Review model.
      Review.query()
        .where('product_id', params.id)
        // .where('is_approved', true)
        .orderBy('created_at', 'desc')
        .limit(50),

      PaymentService.getPublicConfig(),
    ])

    const price = toNumber(productRow.price)
    const salePrice = toNumberOrNull(productRow.salePrice)
    const onSale = salePrice !== null && salePrice < price

    const product = {
      id: productRow.id,
      name: productRow.name ?? '',
      slug: productRow.slug ?? null,
      description: productRow.description ?? null,
      shortDescription: productRow.shortDescription ?? null,
      category: productRow.category ?? '',
      productType: productRow.productType ?? null,

      price,
      salePrice,
      onSale,
      effectivePrice: onSale ? (salePrice as number) : price,
      discountPercent: onSale && price > 0 ? Math.round((1 - salePrice! / price) * 100) : 0,

      commissionRate: toNumber(productRow.commissionRate),
      gravityScore: toNumber(productRow.gravityScore),
      rating: toNumber(productRow.rating),
      reviewCount: toNumber(productRow.reviewCount),
      avgEarningsPerSale: toNumberOrNull(productRow.avgEarningsPerSale),
      conversionRate: toNumberOrNull(productRow.conversionRate),
      refundRate: toNumber(productRow.refundRate),

      imageUrl: resolveAssetUrl(productRow.imageUrl, origin),
      vendorName: productRow.vendorName ?? null,
      billingCycle: productRow.billingCycle ?? 'one_time',
      recurringBilling: Boolean(productRow.recurringBilling),
    }

    const reviews = reviewRows.map((row) => ({
      id: row.id,
      rating: toNumber(row.rating),
      content: row.content ?? '',
      reviewerName: row.reviewerName ?? 'Anonymous',
      isVerifiedPurchase: Boolean(row.isVerifiedPurchase),
      createdAt: row.createdAt?.toISO() ?? null,
    }))

    // One payment object instead of paymentConfig + availablePaymentMethods,
    // which were two shapes of the same data drifting apart.
    const providers = (paymentConfig.providers ?? [])
      .filter((p) => p.enabled && !RETIRED_PROVIDERS.has(p.key))
      .map((p) => ({
        key: p.key,
        label: p.label,
        description: p.description ?? null,
      }))

    const requestedActive = paymentConfig.activeProvider
    const activeProvider =
      requestedActive && providers.some((p) => p.key === requestedActive)
        ? requestedActive
        : (providers[0]?.key ?? null)

    return inertia.render('ProductDetail', {
      product,
      reviews,
      payment: {
        providers,
        activeProvider,
        checkoutAvailable: providers.length > 0,
        currency: paymentConfig.currency ?? 'USD',
        currencySymbol: paymentConfig.currencySymbol ?? '$',
      },
    })
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
    const { WalletService } = await import('#services/wallet_service')
    const [orders, walletSummary] = await Promise.all([
      Order.query()
        .join('products', 'orders.product_id', 'products.id')
        .where('products.vendor_id', auth.user!.id)
        .select('orders.*')
        .orderBy('orders.created_at', 'desc'),
      WalletService.getSummary(auth.user!.id),
    ])
    return inertia.render('vendor/VendorEarnings', {
      user: auth.user,
      orders,
      wallet: walletSummary.wallet,
      transactions: walletSummary.transactions,
      payoutRequests: walletSummary.payoutRequests,
    })
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
    const { PaymentService } = await import('#services/payment_service')
    const [user, paymentConfig] = await Promise.all([
      User.query().where('id', auth.user!.id).firstOrFail(),
      PaymentService.getPublicConfig(),
    ])
    return inertia.render('vendor/VendorProfile', { user: user.serialize(), paymentConfig })
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
    const { WalletService } = await import('#services/wallet_service')
    const [orders, links, walletSummary] = await Promise.all([
      Order.query().where('affiliate_id', auth.user!.id).orderBy('created_at', 'desc'),
      AffiliateLink.query().where('affiliate_id', auth.user!.id),
      WalletService.getSummary(auth.user!.id),
    ])
    return inertia.render('affiliate/AffiliateEarnings', {
      user: auth.user,
      orders,
      links,
      wallet: walletSummary.wallet,
      transactions: walletSummary.transactions,
      payoutRequests: walletSummary.payoutRequests,
    })
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
    const { PaymentService } = await import('#services/payment_service')
    const [user, paymentConfig] = await Promise.all([
      User.query().where('id', auth.user!.id).firstOrFail(),
      PaymentService.getPublicConfig(),
    ])
    return inertia.render('affiliate/AffiliateProfile', { user: user.serialize(), paymentConfig })
  }

  // New admin pages
  async adminSubscribers({ inertia, auth }: HttpContext) {
    const subscribers = await NewsletterSubscriber.query().orderBy('created_at', 'desc').limit(500)
    return inertia.render('admin/AdminSubscribers', { user: auth.user, subscribers })
  }

  async adminBlog({ inertia, auth }: HttpContext) {
    const posts = await BlogPost.query().orderBy('created_at', 'desc').limit(100)
    return inertia.render('admin/AdminBlog', { user: auth.user, posts })
  }

  async adminNewsletterList({ inertia, auth }: HttpContext) {
    const newsletters = await Newsletter.query().orderBy('created_at', 'desc').limit(100)
    const subscriberCount = await NewsletterSubscriber.query()
      .where('status', 'active')
      .count('* as total')
      .first()
    return inertia.render('admin/AdminNewsletterList', {
      user: auth.user,
      newsletters,
      subscriberCount: Number((subscriberCount as any)?.$extras?.total ?? 0),
    })
  }

  async adminNewsletter({ inertia, auth }: HttpContext) {
    const subscriberCount = await NewsletterSubscriber.query()
      .where('status', 'active')
      .count('* as total')
      .first()
    return inertia.render('admin/AdminNewsletter', {
      user: auth.user,
      subscriberCount: Number((subscriberCount as any)?.$extras?.total ?? 0),
    })
  }

  async adminEmailCampaigns({ inertia, auth }: HttpContext) {
    const campaigns = await EmailCampaign.query().orderBy('created_at', 'desc').limit(100)
    const subscriberCount = await NewsletterSubscriber.query()
      .where('status', 'active')
      .count('* as total')
      .first()
    return inertia.render('admin/AdminEmailCampaigns', {
      user: auth.user,
      campaigns,
      subscriberCount: Number((subscriberCount as any)?.$extras?.total ?? 0),
    })
  }

  async adminConversions({ inertia, auth }: HttpContext) {
    const [orders, links] = await Promise.all([
      Order.query().orderBy('created_at', 'desc').limit(500),
      AffiliateLink.query().orderBy('created_at', 'desc').limit(500),
    ])
    return inertia.render('admin/AdminConversions', { user: auth.user, orders, links })
  }

  async adminHeroBanner({ inertia, auth }: HttpContext) {
    const settings = await SiteSetting.all()
    return inertia.render('admin/AdminHeroBanner', { user: auth.user, settings })
  }

  async adminPaymentSettings({ inertia, auth }: HttpContext) {
    const { PaymentService } = await import('#services/payment_service')
    const paymentConfig = await PaymentService.getConfig()
    return inertia.render('admin/AdminPaymentSettings', {
      user: auth.user,
      paymentConfig,
    })
  }

  async adminPayouts({ inertia, auth }: HttpContext) {
    const { WalletService } = await import('#services/wallet_service')
    const payouts = await WalletService.listPayoutRequests('all')
    return inertia.render('admin/AdminPayouts', {
      user: auth.user,
      payouts: payouts.map((p) => ({
        ...p.serialize(),
        user: p.user
          ? {
              id: p.user.id,
              fullName: p.user.fullName,
              email: p.user.email,
              role: p.user.role,
            }
          : null,
      })),
    })
  }
}
