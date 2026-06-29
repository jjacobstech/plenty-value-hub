import User from '#models/user'
import Order from '#models/order'
import Product from '#models/product'
import AffiliateLink from '#models/affiliate_link'
import NewsletterSubscriber from '#models/newsletter_subscriber'
import type { HttpContext } from '@adonisjs/core/http'
import Decimal from 'decimal.js'

export default class AdminController {
  async getPlatformStats({ auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can access platform stats' })
    }

    const [orders, products, users, affiliateLinks, subscribers] = await Promise.all([
      Order.all(),
      Product.all(),
      User.all(),
      AffiliateLink.all(),
      NewsletterSubscriber.all(),
    ])

    const completedOrders = orders.filter((o) => o.status === 'completed')
    const refundedOrders = orders.filter((o) => o.status === 'refunded')

    const gmv = completedOrders.reduce((sum, o) => sum + new Decimal(o.amount).toNumber(), 0)
    const platformRevenue = completedOrders.reduce(
      (sum, o) => sum + new Decimal(o.platformFee || 0).toNumber(),
      0
    )
    const totalCommissions = completedOrders.reduce(
      (sum, o) => sum + new Decimal(o.commissionAmount || 0).toNumber(),
      0
    )

    const refundRate =
      orders.length > 0 ? ((refundedOrders.length / orders.length) * 100).toFixed(1) : '0'

    const approvedProducts = products.filter((p) => p.status === 'approved')
    const pendingProducts = products.filter((p) => p.status === 'pending')

    const activeLinks = affiliateLinks.filter((l) => l.status === 'active')
    const totalClicks = affiliateLinks.reduce((sum, l) => sum + (l.clicks || 0), 0)
    const totalConversions = affiliateLinks.reduce((sum, l) => sum + (l.conversions || 0), 0)

    const topProducts = products
      .sort((a, b) => new Decimal(b.totalRevenue || 0).minus(a.totalRevenue || 0).toNumber())
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        name: p.name,
        totalSales: p.totalSales,
        totalRevenue: p.totalRevenue,
        commissionRate: p.commissionRate,
        category: p.category,
      }))

    const affiliateEarnings: Record<number, number> = {}
    completedOrders.forEach((o) => {
      if (o.affiliateId) {
        affiliateEarnings[o.affiliateId] = (affiliateEarnings[o.affiliateId] || 0)
          + new Decimal(o.commissionAmount || 0).toNumber()
      }
    })

    const topAffiliates = Object.entries(affiliateEarnings)
      .map(([affiliateId, earned]) => ({
        affiliateId: parseInt(affiliateId),
        earned,
      }))
      .sort((a, b) => b.earned - a.earned)
      .slice(0, 5)

    const revenueByCategory: Record<string, number> = {}
    completedOrders.forEach((o) => {
      const product = products.find((p) => p.id === o.productId)
      if (product) {
        revenueByCategory[product.category] = (revenueByCategory[product.category] || 0)
          + new Decimal(o.amount).toNumber()
      }
    })

    const userCounts = {
      total: users.length,
      vendors: users.filter((u) => u.role === 'vendor').length,
      affiliates: users.filter((u) => u.role === 'affiliate').length,
      consumers: users.filter((u) => u.role === 'consumer').length,
      admins: users.filter((u) => u.role === 'admin').length,
    }

    const activeSubscribers = subscribers.filter((s) => s.status === 'active')

    return response.json({ success: true, stats: {
        orders: {
          total: orders.length,
          completed: completedOrders.length,
          refunded: refundedOrders.length,
          refundRate: parseFloat(refundRate as string),
        },
        financials: {
          gmv,
          platformRevenue,
          totalCommissions,
        },
        users: userCounts,
        products: {
          total: products.length,
          approved: approvedProducts.length,
          pending: pendingProducts.length,
        },
        subscribers: {
          total: subscribers.length,
          active: activeSubscribers.length,
        },
        affiliateLinks: {
          total: affiliateLinks.length,
          active: activeLinks.length,
          totalClicks,
          totalConversions,
        },
        topProducts,
        topAffiliates,
        revenueByCategory,
      },
    })
  }

  async updateUser({ params, request, response, auth }: HttpContext) {
    const currentUser = auth.use('web').user!
    if (currentUser.role !== 'admin') {
      return response.status(403).json({ error: 'Forbidden' })
    }
    const user = await User.findOrFail(params.id)
    const { role } = request.only(['role'])
    user.role = role
    await user.save()
    return response.json(user)
  }
}