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
import { PaymentService } from '#services/payment_service'
import type { HttpContext } from '@adonisjs/core/http'
import type { DateTime } from 'luxon'
import env from '#start/env'

/** ISO text for a Luxon date. Empty when there is no date. */
const isoOf = (date: DateTime | null | undefined): string => date?.toISO() ?? ''

/** The admin user row: never the password or tokens. */
const toUserRow = (user: User) => ({
  id: user.id,
  role: user.role,
  email: user.email,
  fullName: user.fullName ?? undefined,
})

/** The admin order row. Money stays a string, as the database returns it. */
const toAdminOrderRow = (order: Order) => ({
  id: order.id,
  status: order.status,
  amount: String(order.amount),
  platformFee: order.platformFee === null ? null : String(order.platformFee),
  commissionAmount: order.commissionAmount === null ? null : String(order.commissionAmount),
  productId: order.productId,
  productName: order.productName || order.product?.name || null,
  buyerId: order.buyerId,
  vendorId: order.vendorId,
  affiliateId: order.affiliateId,
  createdAt: isoOf(order.createdAt),
})

/** The admin affiliate-link row. Counts come from the totals columns, not the relations. */
const toAdminLinkRow = (link: AffiliateLink) => ({
  id: link.id,
  status: link.status,
  clicks: link.totalClicks,
  conversions: link.totalConversions,
  commissionEarned: String(link.commissionEarned),
  revenue: String(link.revenue),
  productName: link.productName || link.product?.name || null,
  affiliateId: link.affiliateId,
  affiliateName: link.affiliate?.fullName || link.affiliate?.businessName || null,
  createdAt: isoOf(link.createdAt),
})

/** ISO text for a Luxon date, or null when there is none. */
const isoOrNull = (date: DateTime | null | undefined): string | null => date?.toISO() ?? null

/** The affiliate's own link row (the affiliate pages read both casings). */
const toAffiliateLinkRow = (link: AffiliateLink) => ({
  id: link.id,
  linkCode: link.linkCode,
  link_code: link.linkCode,
  product_name: link.productName,
  status: link.status,
  clicks: link.totalClicks,
  conversions: link.totalConversions,
  revenue: link.revenue,
  commission_earned: link.commissionEarned,
})

const toSubscriberRow = (subscriber: NewsletterSubscriber) => ({
  id: subscriber.id,
  email: subscriber.email,
  name: subscriber.name,
  status: subscriber.status,
  source: subscriber.source,
  createdAt: isoOf(subscriber.createdAt),
})

const toBlogPostRow = (post: BlogPost) => ({
  id: post.id,
  title: post.title,
  slug: post.slug,
  excerpt: post.excerpt,
  content: post.content,
  featuredImageUrl: post.featuredImageUrl,
  category: post.category,
  tags: Array.isArray(post.tags) ? post.tags.filter((tag): tag is string => typeof tag === 'string') : null,
  authorName: post.authorName,
  status: post.status,
  seoTitle: post.seoTitle,
  seoDescription: post.seoDescription,
  readTimeMinutes: post.readTimeMinutes,
  viewCount: post.viewCount,
  publishedAt: isoOrNull(post.publishedAt),
  createdAt: isoOf(post.createdAt),
})

const toNewsletterRow = (newsletter: Newsletter) => ({
  id: newsletter.id,
  subject: newsletter.subject,
  category: newsletter.category,
  status: newsletter.status,
  recipientsCount: newsletter.recipientsCount,
  openCount: newsletter.openCount,
  clickCount: newsletter.clickCount,
  revenueGenerated: Number(newsletter.revenueGenerated),
  sentAt: isoOrNull(newsletter.sentAt),
  createdAt: isoOf(newsletter.createdAt),
})

const toCampaignRow = (campaign: EmailCampaign) => ({
  id: campaign.id,
  name: campaign.name,
  subject: campaign.subject,
  content: campaign.content,
  campaignType: campaign.campaignType,
  audienceSegment: campaign.audienceSegment,
  status: campaign.status,
  recipientsCount: campaign.recipientsCount,
  openCount: campaign.openCount,
  clickCount: campaign.clickCount,
  conversionCount: campaign.conversionCount,
  revenueGenerated: Number(campaign.revenueGenerated),
  sentAt: isoOrNull(campaign.sentAt),
})

/** The conversions page's order row. */
const toConversionOrderRow = (order: Order) => ({
  id: order.id,
  amount: String(order.amount),
  status: order.status,
  affiliateId: order.affiliateId,
  createdAt: isoOf(order.createdAt),
  productName: order.productName || order.product?.name || null,
})

/** The conversions page's link row. */
const toConversionLinkRow = (link: AffiliateLink) => ({
  id: link.id,
  clicks: link.totalClicks,
  conversions: link.totalConversions,
  revenue: String(link.revenue),
  campaignName: link.campaign?.name ?? null,
  productName: link.productName || link.product?.name || null,
  status: link.status,
})

/** The full product row for the admin products table. */
const toProductDto = (product: Product) => ({
  id: product.id,
  uuid: product.uuid ?? null,
  name: product.name,
  slug: product.slug ?? null,
  description: product.description ?? null,
  shortDescription: product.shortDescription ?? null,
  category: product.category,
  productType: product.productType,
  price: String(product.price),
  salePrice: product.salePrice === null ? null : String(product.salePrice),
  commissionRate: product.commissionRate === null ? null : String(product.commissionRate),
  vendorId: product.vendorId,
  vendorName: product.vendorName ?? null,
  imageUrl: product.imageUrl,
  galleryUrls: product.galleryUrls,
  status: product.status,
  gravityScore: product.gravityScore,
  avgEarningsPerSale: product.avgEarningsPerSale === null ? null : String(product.avgEarningsPerSale),
  conversionRate: product.conversionRate === null ? null : String(product.conversionRate),
  refundRate: product.refundRate === null ? null : String(product.refundRate),
  totalSales: product.totalSales,
  totalRevenue: product.totalRevenue === null ? null : String(product.totalRevenue),
  rating: product.rating === null ? null : String(product.rating),
  reviewCount: product.reviewCount,
  isFeatured: product.isFeatured,
  tags: product.tags,
  recurringBilling: product.recurringBilling,
  billingCycle: product.billingCycle,
  createdAt: isoOf(product.createdAt),
  updatedAt: isoOrNull(product.updatedAt),
  digitalAssetUrl: product.digitalAssetUrl,
  digitalAssetName: product.digitalAssetName,
})

/** The vendor's order row. Money stays a string. */
const toVendorOrderRow = (order: Order) => ({
  id: order.id,
  orderNumber: order.orderNumber,
  buyerEmail: order.buyerEmail ?? '',
  amount: String(order.amount),
  vendorPayout: String(order.vendorPayout),
  status: order.status ?? 'pending',
  paymentMethod: order.paymentMethod,
  currency: order.currency ?? '',
  quantity: order.quantity,
  shippingDetails: typeof order.shippingDetails === 'string' ? order.shippingDetails : null,
  createdAt: isoOf(order.createdAt),
  product: order.product
    ? { id: order.product.id, name: order.product.name, productType: order.product.productType, imageUrl: order.product.imageUrl }
    : null,
})

/** The admin product row. */
const toAdminProductRow = (product: Product) => ({
  id: product.id,
  name: product.name,
  status: product.status,
  category: product.category,
  price: product.price === null ? null : String(product.price),
  commissionRate: product.commissionRate === null ? null : String(product.commissionRate),
  totalSales: product.totalSales,
  totalRevenue: product.totalRevenue === null ? null : String(product.totalRevenue),
  vendorId: product.vendorId,
  vendorName: product.vendor?.fullName || product.vendor?.businessName || null,
  createdAt: isoOf(product.createdAt),
})
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

/** Compute whether a vendor or affiliate profile is complete enough to use the platform. */
function computeProfileComplete(user: User): boolean {
  const hasPayout =
    (user.payoutBankName && user.payoutAccountNumber && user.payoutAccountName) ||
    (user.payoutMobileProvider && user.payoutMobileNumber) ||
    !!user.payoutEmail?.trim() ||
    !!user.payoutAccountId?.trim()

  if (user.role === 'vendor') {
    return !!(
      user.businessName?.trim() &&
      user.businessDescription?.trim() &&
      user.phone?.trim() &&
      user.payoutMethod &&
      hasPayout
    )
  }
  if (user.role === 'affiliate') {
    return !!(
      user.niche?.trim() &&
      user.marketingChannels?.trim() &&
      user.phone?.trim() &&
      user.payoutMethod &&
      hasPayout
    )
  }
  return true
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
    const heroBanner = await SiteSetting.findBy('key', 'hero_banner')

    return inertia.render('Home', {
      heroBannerImage: heroBanner?.value || '/hero-banner.png',
    })
  }

  async marketplace({ inertia }: HttpContext) {
    const products = await Product.query().where('status', 'approved').limit(100)
    return inertia.render('Marketplace', { products })
  }

  async trackOrder({ inertia }: HttpContext) {
    const supportEmail = env.get('SUPPORT_EMAIL', 'support@plentyvalue.com')
    return inertia.render('OrderTracking', { supportEmail })
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

    const UUID_REGEX =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    const rawParamId = String(params.id ?? '').trim()
    const isUuid = UUID_REGEX.test(rawParamId)
    const isNumeric = /^\d+$/.test(rawParamId)

    const [productRow, reviewRows, paymentConfig] = await Promise.all([
      Product.query()
        .where((q) => {
          if (isUuid) {
            q.where('uuid', rawParamId)
          } else if (isNumeric) {
            q.where('id', rawParamId)
          } else {
            q.where('slug', rawParamId).orWhere(
              'id',
              Number.isNaN(Number(rawParamId)) ? 0 : Number(rawParamId)
            )
          }
        })
        .where('status', 'approved')
        .firstOrFail(),

      Review.query()
        .where((q) => {
          if (isUuid) {
            q.where('uuid', rawParamId)
          } else if (isNumeric) {
            q.where('product_id', rawParamId)
          } else {
            q.where('product_id', 0)
          }
        })
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
      galleryUrls: Array.isArray(productRow.galleryUrls)
        ? (productRow.galleryUrls as string[])
            .map((u) => resolveAssetUrl(u, origin))
            .filter((u): u is string => u !== null)
        : [],
      vendorName: productRow.vendorName ?? null,
      billingCycle: productRow.billingCycle ?? 'one_time',
      recurringBilling: Boolean(productRow.recurringBilling),
      unitCount: productRow.unitCount ?? null,
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
      .filter((p: any) => p.enabled && !RETIRED_PROVIDERS.has(p.key))
      .map((p: any) => ({
        key: p.key,
        label: p.name || p.key,
        description: null,
      }))

    const requestedActive = paymentConfig.activeProvider
    const activeProvider =
      requestedActive && providers.some((p) => p.key === requestedActive)
        ? requestedActive
        : (providers[0]?.key ?? null)

    // Check for payment completion / redirect verification parameters
    const rawRefInput =
      request.input('reference') ||
      request.input('trxref') ||
      request.input('tx_ref') ||
      request.input('session_id') ||
      request.input('orderNumber') ||
      request.input('order_number')

    let paymentRef: string | undefined
    if (Array.isArray(rawRefInput)) {
      paymentRef = String(rawRefInput[0] || '').trim()
    } else if (typeof rawRefInput === 'string') {
      paymentRef = rawRefInput.trim()
    } else if (rawRefInput && typeof rawRefInput === 'object') {
      const strVal = String(Object.values(rawRefInput)[0] || '').trim()
      if (strVal) paymentRef = strVal
    }

    let orderNotice: {
      success: boolean
      orderNumber: string
      status: string
      message: string
      digitalAssetUrl?: string | null
      digitalAssetName?: string | null
    } | null = null

    if (paymentRef && paymentRef.length > 0) {
      try {
        const orderQuery = Order.query().where('orderNumber', paymentRef)
        if (UUID_REGEX.test(paymentRef)) {
          orderQuery.orWhere('uuid', paymentRef)
        }
        const order = await orderQuery.first()

        if (order) {
          if (order.status === 'pending') {
            const provider =
              (request.input('provider') || order.paymentMethod || 'paystack') as string
            const { paymentGateway } = await import('#services/payment_gateway')

            const verifyResult = await paymentGateway.verifyPayment(
              order.orderNumber,
              order.orderNumber,
              provider
            )

            const statusInput = String(request.input('status') || '').toLowerCase()
            const isRedirectSuccess =
              statusInput === 'success' ||
              statusInput === 'successful' ||
              statusInput === 'completed' ||
              Boolean(request.input('reference')) ||
              Boolean(request.input('trxref')) ||
              Boolean(request.input('tx_ref'))

            if (verifyResult.success || isRedirectSuccess) {
              const isDigital = productRow.productType === 'digital'
              order.status = isDigital ? 'completed' : 'processing'
              if (provider) order.paymentMethod = provider
              await order.save()

              const orderedQty = order.quantity ?? 1
              productRow.totalSales = (productRow.totalSales || 0) + orderedQty
              const { Decimal } = await import('decimal.js')
              productRow.totalRevenue = new Decimal(productRow.totalRevenue || 0)
                .plus(order.amount)
                .toDecimalPlaces(2)
                .toString()
              productRow.gravityScore = Math.min(100, (productRow.gravityScore || 0) + 1)
              if (
                productRow.unitCount !== null &&
                productRow.unitCount !== undefined &&
                productRow.unitCount > 0
              ) {
                productRow.unitCount = Math.max(0, productRow.unitCount - orderedQty)
              }
              await productRow.save()

              if (order.affiliateLinkId) {
                const affiliateLink = await AffiliateLink.find(order.affiliateLinkId)
                if (affiliateLink) {
                  affiliateLink.totalConversions = (affiliateLink.totalConversions || 0) + 1
                  affiliateLink.revenue = (affiliateLink.revenue || 0) + Number(order.amount || 0)
                  affiliateLink.commissionEarned = (affiliateLink.commissionEarned || 0) + Number(order.commissionAmount || 0)
                  await affiliateLink.save()
                }
              }

              const { NotificationService } = await import('#services/notification_service')

              if (isDigital) {
                await NotificationService.notifyOrderCompleted(order, productRow)
                console.log(
                  `[PagesController.productDetail] Digital product order #${order.orderNumber} completed & notification sent immediately on return.`
                )
              } else {
                await NotificationService.notifyOrderProcessing(order, productRow)
                console.log(
                  `[PagesController.productDetail] Physical product order #${order.orderNumber} set to processing & notification sent immediately on return.`
                )
              }
            }
          }

          orderNotice = {
            success: order.status === 'completed' || order.status === 'processing',
            orderNumber: order.orderNumber,
            status: order.status ?? 'pending',
            message:
              order.status === 'completed'
                ? 'Your payment was successful and your order is complete! Confirmation and digital asset details have been sent to your email.'
                : order.status === 'processing'
                  ? 'Your payment was successful! Your order is currently being processed.'
                  : 'Payment is pending verification.',
            digitalAssetUrl:
              order.status === 'completed' && productRow.productType === 'digital'
                ? productRow.digitalAssetUrl
                : null,
            digitalAssetName:
              order.status === 'completed' && productRow.productType === 'digital'
                ? productRow.digitalAssetName || productRow.name
                : null,
          }
        }
      } catch (err: any) {
        console.error(
          '[PagesController.productDetail] Payment verification on redirect failed:',
          err
        )
      }
    }

    return inertia.render('ProductDetail', {
      product,
      reviews,
      orderNotice,
      payment: {
        providers,
        activeProvider,
        checkoutAvailable: providers.length > 0,
        currency: paymentConfig.currency ?? 'USD',
        currencySymbol: paymentConfig.currencySymbol ?? '$',
      },
    })
  }

  async affiliateRedirect({ inertia, params, response, auth }: HttpContext) {
    const linkCode = String(params.link_code || '').trim()
    let productId: number | null = null

    if (linkCode) {
      try {
        const link = await AffiliateLink.findBy('linkCode', linkCode)
        if (link && link.status === 'active') {
          productId = link.productId

          const authUser = auth?.use('web')?.user
          const isSelfReferral = authUser && authUser.id === link.affiliateId

          if (!isSelfReferral) {
            link.totalClicks = (link.totalClicks || 0) + 1
            await link.save()

            const cookiePayload = JSON.stringify({
              affiliateId: link.affiliateId,
              linkId: link.id,
              linkCode: link.linkCode,
              productId: link.productId,
            })

            const maxAgeInSeconds = 30 * 24 * 60 * 60
            response.cookie('pv_aff_attr', cookiePayload, {
              httpOnly: true,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              maxAge: maxAgeInSeconds,
            })

            response.cookie('pv_ref_code', link.linkCode, {
              httpOnly: false,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              maxAge: maxAgeInSeconds,
            })
          }
        }
      } catch (err) {
        console.error('[PagesController.affiliateRedirect] Error processing referral link:', err)
      }
    }

    return inertia.render('AffiliateRedirect', {
      link_code: linkCode,
      targetProductId: productId,
    })
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
  async adminDashboard({ inertia }: HttpContext) {
    const [users, products, orders, subscriberCount] = await Promise.all([
      User.all(),
      Product.query().preload('vendor').orderBy('created_at', 'desc'),
      Order.query()
        .preload('product')
        .preload('buyer')
        .preload('vendor')
        .preload('affiliate')
        .orderBy('created_at', 'desc')
        .limit(500),
      NewsletterSubscriber.query().count('* as total').first(),
    ])

    // Serialize data for Inertia to avoid issues with model instances
    const serializedOrders = orders.map(toAdminOrderRow)

    const serializedProducts = products.map(toAdminProductRow)

    return inertia.render('admin/AdminDashboard', {
      users: users.map(toUserRow),
      products: serializedProducts,
      orders: serializedOrders,
      subscriberCount: Number(subscriberCount?.$extras.total ?? 0),
    })
  }

  async adminUsers({ inertia, auth }: HttpContext) {
    const users = await User.query()
      .where('id', '!=', auth.user?.id as number)
      .orderBy('created_at', 'desc')
      .limit(200)

    return inertia.render('admin/AdminUsers', { users })
  }

  async adminProducts({ inertia }: HttpContext) {
    const products = await Product.query().orderBy('created_at', 'desc').limit(200)
    return inertia.render('admin/AdminProducts', { products: products.map(toProductDto) })
  }

  async adminOrders({ inertia }: HttpContext) {
    const orders = await Order.query().orderBy('created_at', 'desc').limit(200)
    return inertia.render('admin/AdminOrders', { orders })
  }

  async adminAnalytics({ inertia }: HttpContext) {
    const [users, products, orders, links] = await Promise.all([
      User.all(),
      Product.query().preload('vendor').orderBy('created_at', 'desc'),
      Order.query()
        .preload('product')
        .preload('buyer')
        .preload('vendor')
        .preload('affiliate')
        .orderBy('created_at', 'desc')
        .limit(500),
      AffiliateLink.query().preload('product').preload('affiliate'),
    ])

    // Serialize data for consistent frontend access
    const serializedOrders = orders.map(toAdminOrderRow)

    const serializedProducts = products.map(toAdminProductRow)

    const serializedLinks = links.map(toAdminLinkRow)

    return inertia.render('admin/AdminAnalytics', {
      users: users.map(toUserRow),
      products: serializedProducts,
      orders: serializedOrders,
      links: serializedLinks,
    })
  }

  // Vendor pages
  async vendorDashboard({ inertia, auth }: HttpContext) {
    const [vendorProducts, vendorOrders] = await Promise.all([
      Product.query().where('vendor_id', auth.user!.id),
      Order.query()
        .join('products', 'orders.product_id', 'products.id')
        .where('products.vendor_id', auth.user!.id)
        .select('orders.*', 'products.name as product_name')
        .orderBy('orders.created_at', 'desc'),
    ])

    const serializedOrders = vendorOrders.map((o) => {
      const raw = o.serialize()
      return {
        ...raw,
        vendorPayout: Number(raw.vendorPayout || raw.vendor_payout || 0),
        amount: Number(raw.amount || 0),
        productName: o.$extras.product_name || raw.productName || 'Product',
        affiliateId: raw.affiliateId || raw.affiliate_id || null,
      }
    })

    return inertia.render('vendor/VendorDashboard', {
      products: vendorProducts,
      orders: serializedOrders,
      wallet: null,
      profileComplete: computeProfileComplete(auth.user!),
    })
  }

  async vendorProducts({ inertia, auth }: HttpContext) {
    const [products, commissionSetting, affiliateCommissionSetting] = await Promise.all([
      Product.query().where('vendor_id', auth.user!.id),
      SiteSetting.findBy('key', 'platform_commission'),
      SiteSetting.findBy('key', 'affiliate_commission'),
    ])
    const commission = Number(commissionSetting?.value)
    const affiliateCommission = Number(affiliateCommissionSetting?.value)
    return inertia.render('vendor/VendorProducts', {
      products,
      platformCommission:
        Number.isFinite(commission) && commission >= 0 && commission <= 100 ? commission : 10,
      affiliateCommission:
        Number.isFinite(affiliateCommission) && affiliateCommission >= 0 && affiliateCommission <= 100
          ? affiliateCommission
          : 7,
      profileComplete: computeProfileComplete(auth.user!),
    })
  }

  async vendorOrders({ inertia, auth }: HttpContext) {
    const orders = await Order.query()
      .join('products', 'orders.product_id', 'products.id')
      .where('products.vendor_id', auth.user!.id)
      .select('orders.*')
      .preload('product' as never)
      .orderBy('orders.created_at', 'desc')

    return inertia.render('vendor/VendorOrders', {
      orders: orders.map(toVendorOrderRow),
    })
  }

  async vendorKYC({ inertia }: HttpContext) {
    return inertia.render('VendorKYC', {})
  }

  async vendorEarnings({ inertia, auth }: HttpContext) {
    const [orders] = await Promise.all([
      Order.query()
        .join('products', 'orders.product_id', 'products.id')
        .where('products.vendor_id', auth.user!.id)
        .select('orders.*')
        .orderBy('orders.created_at', 'desc'),
    ])
    return inertia.render('vendor/VendorEarnings', {
      orders,
      wallet: null,
      transactions: [],
      payoutRequests: [],
    })
  }

  async vendorAnalytics({ inertia, auth }: HttpContext) {
    const [orders, products] = await Promise.all([
      Order.query()
        .join('products', 'orders.product_id', 'products.id')
        .where('products.vendor_id', auth.user!.id)
        .select('orders.*')
        .orderBy('orders.created_at', 'desc'),
      Product.query().where('vendor_id', auth.user!.id),
    ])

    const serializedOrders = orders.map((o) => o.serialize())
    const serializedProducts = products.map((p) => p.serialize())

    // Compute live per-product sales count and revenue from actual orders
    // (more accurate than the denormalized totalSales/totalRevenue columns on Product)
    const productStatsMap: Record<number, { totalSales: number; totalRevenue: number }> = {}
    for (const o of serializedOrders) {
      if (o.status !== 'completed' || !o.productId) continue
      if (!productStatsMap[o.productId]) {
        productStatsMap[o.productId] = { totalSales: 0, totalRevenue: 0 }
      }
      productStatsMap[o.productId].totalSales += 1
      productStatsMap[o.productId].totalRevenue += parseFloat(o.vendorPayout) || 0
    }

    const enrichedProducts = serializedProducts.map((p) => {
      const stats = productStatsMap[p.id]
      return {
        ...p,
        totalSales: stats?.totalSales ?? p.totalSales ?? 0,
        totalRevenue: stats ? stats.totalRevenue.toFixed(2) : (p.totalRevenue ?? '0'),
      }
    })
    console.log({
      user: auth.user,
      orders: serializedOrders,
      products: enrichedProducts,
    })
    return inertia.render('vendor/VendorAnalytics', {
      orders: serializedOrders,
      products: enrichedProducts,
    })
  }

  async vendorProfile({ inertia, auth }: HttpContext) {
    await User.query().where('id', auth.user!.id).firstOrFail()
    return inertia.render('vendor/VendorProfile', { paymentConfig: null })
  }

  async vendorIntegrations({ inertia }: HttpContext) {
    return inertia.render('vendor/VendorIntegrations', {})
  }

  // Affiliate pages
  async affiliateDashboard({ inertia, auth }: HttpContext) {
    const links = await AffiliateLink.query().where('affiliate_id', auth.user!.id)
    const orders = await Order.query()
      .where('affiliate_id', auth.user!.id)
      .orderBy('created_at', 'desc')
    return inertia.render('affiliate/AffiliateDashboard', {
      links,
      orders,
      profileComplete: computeProfileComplete(auth.user!),
    })
  }

  async affiliateProducts({ inertia }: HttpContext) {
    const products = await Product.query().where('status', 'approved').limit(50)
    return inertia.render('affiliate/AffiliateProducts', { products })
  }

  async affiliateLinks({ inertia, auth }: HttpContext) {
    const links = await AffiliateLink.query().where('affiliate_id', auth.user!.id)
    return inertia.render('affiliate/AffiliateLinks', { links: links.map(toAffiliateLinkRow) })
  }

  async affiliateEarnings({ inertia, auth }: HttpContext) {
    const [orders, links] = await Promise.all([
      Order.query().where('affiliate_id', auth.user!.id).orderBy('created_at', 'desc'),
      AffiliateLink.query().where('affiliate_id', auth.user!.id),
    ])
    return inertia.render('affiliate/AffiliateEarnings', {
      orders,
      links,
      wallet: null,
      transactions: [],
      payoutRequests: [],
    })
  }

  async affiliatePerformance({ inertia, auth }: HttpContext) {
    const links = await AffiliateLink.query().where('affiliate_id', auth.user!.id)
    return inertia.render('affiliate/AffiliatePerformance', { links: links.map(toAffiliateLinkRow) })
  }

  async affiliateProfile({ inertia, auth }: HttpContext) {
    await User.query().where('id', auth.user!.id).firstOrFail()
    return inertia.render('affiliate/AffiliateProfile', { paymentConfig: null })
  }

  // New admin pages
  async adminSubscribers({ inertia }: HttpContext) {
    const subscribers = await NewsletterSubscriber.query().orderBy('created_at', 'desc').limit(500)
    return inertia.render('admin/AdminSubscribers', { subscribers: subscribers.map(toSubscriberRow) })
  }

  async adminBlog({ inertia }: HttpContext) {
    const posts = await BlogPost.query().orderBy('created_at', 'desc').limit(100)
    return inertia.render('admin/AdminBlog', { posts: posts.map(toBlogPostRow) })
  }

  async adminNewsletterList({ inertia }: HttpContext) {
    const newsletters = await Newsletter.query().orderBy('created_at', 'desc').limit(100)
    const subscriberCount = await NewsletterSubscriber.query()
      .where('status', 'active')
      .count('* as total')
      .first()
    return inertia.render('admin/AdminNewsletterList', {
      newsletters: newsletters.map(toNewsletterRow),
      subscriberCount: Number(subscriberCount?.$extras.total ?? 0),
    })
  }

  async adminNewsletter({ inertia }: HttpContext) {
    const subscriberCount = await NewsletterSubscriber.query()
      .where('status', 'active')
      .count('* as total')
      .first()
    return inertia.render('admin/AdminNewsletter', {
      subscriberCount: Number(subscriberCount?.$extras.total ?? 0),
    })
  }

  async adminEmailCampaigns({ inertia }: HttpContext) {
    const campaigns = await EmailCampaign.query().orderBy('created_at', 'desc').limit(100)
    const subscriberCount = await NewsletterSubscriber.query()
      .where('status', 'active')
      .count('* as total')
      .first()
    return inertia.render('admin/AdminEmailCampaigns', {
      campaigns: campaigns.map(toCampaignRow),
      subscriberCount: Number(subscriberCount?.$extras.total ?? 0),
    })
  }

  async adminConversions({ inertia }: HttpContext) {
    const [orders, links] = await Promise.all([
      Order.query().orderBy('created_at', 'desc').limit(500),
      AffiliateLink.query().orderBy('created_at', 'desc').limit(500),
    ])
    return inertia.render('admin/AdminConversions', { orders: orders.map(toConversionOrderRow), links: links.map(toConversionLinkRow) })
  }

  async adminHeroBanner({ inertia }: HttpContext) {
    const settings = await SiteSetting.all()
    return inertia.render('admin/AdminHeroBanner', { settings })
  }

  async adminPaymentSettings({ inertia }: HttpContext) {
    const commissionSetting = await SiteSetting.findBy('key', 'platform_commission')
    const commission = Number(commissionSetting?.value)
    return inertia.render('admin/AdminPaymentSettings', {
      paymentConfig: null,
      platformCommission:
        Number.isFinite(commission) && commission >= 0 && commission <= 100 ? commission : 10,
    })
  }

  async adminPayouts({ inertia }: HttpContext) {
    return inertia.render('admin/AdminPayouts', {
      payouts: [],
    })
  }

  async adminDisputes({ inertia }: HttpContext) {
    return inertia.render('admin/AdminDisputes', {})
  }

  async adminFraudDetection({ inertia }: HttpContext) {
    return inertia.render('admin/AdminFraudDetection', {})
  }

  async campaignDiscovery({ inertia }: HttpContext) {
    return inertia.render('affiliate/CampaignDiscovery', {})
  }
}
