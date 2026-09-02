import User from '#models/user'
import Order from '#models/order'
import Product from '#models/product'
import AffiliateLink from '#models/affiliate_link'
import NewsletterSubscriber from '#models/newsletter_subscriber'
import type { HttpContext } from '@adonisjs/core/http'
import { Decimal } from 'decimal.js'

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
        affiliateEarnings[o.affiliateId] =
          (affiliateEarnings[o.affiliateId] || 0) + new Decimal(o.commissionAmount || 0).toNumber()
      }
    })

    const topAffiliates = Object.entries(affiliateEarnings)
      .map(([affiliateId, earned]) => ({
        affiliateId: Number.parseInt(affiliateId),
        earned,
      }))
      .sort((a, b) => b.earned - a.earned)
      .slice(0, 5)

    const revenueByCategory: Record<string, number> = {}
    completedOrders.forEach((o) => {
      const product = products.find((p) => p.id === o.productId)
      if (product) {
        revenueByCategory[product.category] =
          (revenueByCategory[product.category] || 0) + new Decimal(o.amount).toNumber()
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

    return response.json({
      success: true,
      stats: {
        orders: {
          total: orders.length,
          completed: completedOrders.length,
          refunded: refundedOrders.length,
          refundRate: Number.parseFloat(refundRate as string),
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
    const { role, status } = request.only(['role', 'status'])
    if (role !== undefined) {
      user.role = role
    }
    if (status !== undefined) {
      if (!['active', 'inactive'].includes(status)) {
        return response.status(400).json({ error: 'Invalid status. Must be active or inactive.' })
      }
      user.status = status
    }
    await user.save()
    return response.json(user)
  }

  async deleteUser({ params, response, auth }: HttpContext) {
    const currentUser = auth.use('web').user!
    if (currentUser.role !== 'admin') {
      return response.status(403).json({ error: 'Forbidden' })
    }
    // Prevent self-deactivation
    if (currentUser.id === Number(params.id)) {
      return response.status(400).json({ error: 'You cannot deactivate your own account' })
    }
    const user = await User.findOrFail(params.id)
    // Soft delete: mark user inactive, preserve all data
    user.status = 'inactive'
    await user.save()
    return response.json({ success: true, message: 'User deactivated' })
  }

  /**
   * Diagnostic endpoint to check current auth status
   * Useful for debugging permission issues
   */
  async authStatus({ auth, response }: HttpContext) {
    const user = auth.user
    console.log('[AuthStatus] Current auth state:', {
      isAuthenticated: !!user,
      userId: user?.id,
      email: user?.email,
      role: user?.role,
      fullName: user?.fullName,
    })
    return response.json({
      isAuthenticated: !!user,
      user: user
        ? {
            id: user.id,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
          }
        : null,
    })
  }

  /**
   * Debug endpoint to list Paystack banks and troubleshoot bank code issues
   */
  async debugPaystackBanks({ auth, response }: HttpContext) {
    const user = auth.use('web').user!
    
    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can access debug endpoints' })
    }

    try {
      const { WalletService } = await import('#services/wallet_service')
      const banks = await WalletService.listPaystackBanks()
      
      return response.json({
        success: true,
        totalBanks: banks.length,
        gtbBanks: banks.filter(b => 
          b.name.toLowerCase().includes('guaranty') || 
          b.name.toLowerCase().includes('gtb')
        ),
        allBanks: banks.slice(0, 50) // Limit to first 50 for response size
      })
    } catch (error: any) {
      console.error('[AdminController] Error fetching banks:', error.message)
      return response.status(500).json({ 
        error: 'Failed to fetch banks', 
        message: error.message 
      })
    }
  }

  /**
   * Retry a failed Paystack transfer
   */
  async retryFailedTransfer({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    
    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can retry transfers' })
    }

    try {
      const payoutId = parseInt(params.id)
      const { WalletService } = await import('#services/wallet_service')
      const result = await WalletService.retryPaystackTransfer(payoutId)
      
      return response.json(result)
    } catch (error: any) {
      console.error('[AdminController] Error retrying transfer:', error.message)
      return response.status(500).json({ 
        error: 'Failed to retry transfer', 
        message: error.message 
      })
    }
  }

  /**
   * Test email sending functionality
   */
  async testEmail({ auth, response, request }: HttpContext) {
    const user = auth.use('web').user!
    
    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can test emails' })
    }

    try {
      const { orderId } = request.only(['orderId'])
      
      if (orderId) {
        // Test with a specific order
        const Order = (await import('#models/order')).default
        const Product = (await import('#models/product')).default
        
        const order = await Order.find(orderId)
        if (!order) {
          return response.status(404).json({ error: 'Order not found' })
        }
        
        const product = await Product.find(order.productId)
        if (!product) {
          return response.status(404).json({ error: 'Product not found' })
        }
        
        const { NotificationService } = await import('#services/notification_service')
        await NotificationService.notifyOrderCompleted(order, product)
        
        return response.json({ 
          success: true, 
          message: `Test email sent for order ${order.orderNumber}`,
          orderNumber: order.orderNumber,
          buyerEmail: order.buyerEmail 
        })
      } else {
        // Send a simple test email
        const mail = (await import('@adonisjs/mail/services/main')).default
        await mail.send((message) => {
          message
            .to(user.email)
            .subject('Test Email from Plenty Value')
            .html('<h1>Test Email</h1><p>This is a test email to verify mail configuration is working.</p>')
        })
        
        return response.json({ 
          success: true, 
          message: `Test email sent to ${user.email}` 
        })
      }
    } catch (error: any) {
      console.error('[AdminController] Error sending test email:', error.message)
      return response.status(500).json({ 
        error: 'Failed to send test email', 
        message: error.message 
      })
    }
  }
}
