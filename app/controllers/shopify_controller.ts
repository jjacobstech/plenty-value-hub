import ShopifyStore from '#models/shopify_store'
import ShopifyProduct from '#models/shopify_product'
import ShopifyOrder from '#models/shopify_order'
import ShopifyService from '#services/shopify_service'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class ShopifyController {
  /**
   * Get OAuth authorization URL
   * POST /api/shopify/auth-url
   */
  async getAuthUrl({ request, response }: HttpContext) {
    const shopDomain = request.input('shop_domain')
    const apiKey = process.env.SHOPIFY_API_KEY

    const redirectUri = `${process.env.APP_URL}/api/shopify/callback`

    if (!shopDomain || !apiKey) {
      return response.status(400).json({
        error: 'Missing shop domain or API key',
      })
    }

    const scopes = ['read_products', 'read_orders', 'read_fulfillments', 'read_customers']
    const authUrl = ShopifyService.getOAuthUrl(shopDomain, apiKey, redirectUri, scopes)

    return response.json({
      success: true,
      data: { auth_url: authUrl },
    })
  }

  /**
   * Shopify OAuth callback
   * GET /api/shopify/callback
   */
  async handleCallback({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Only vendors can connect Shopify stores' })
    }

    const code = request.input('code')
    const shop = request.input('shop')

    if (!code || !shop) {
      return response.status(400).json({
        error: 'Missing authorization code or shop domain',
      })
    }

    try {
      const apiKey = process.env.SHOPIFY_API_KEY!
      const apiSecret = process.env.SHOPIFY_API_SECRET!

      const { accessToken } = await ShopifyService.exchangeAuthCode(shop, code, apiKey, apiSecret)

      const store = await ShopifyService.createStoreConnection(user.id, shop, accessToken)

      return response.json({
        success: true,
        message: 'Shopify store connected',
        data: store.serialize(),
      })
    } catch (error) {
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to connect store',
      })
    }
  }

  /**
   * Get connected Shopify store
   * GET /api/shopify/store
   */
  async getStore({ auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    try {
      const store = await ShopifyStore.query()
        .where('vendor_id', user.id)
        .firstOrFail()

      const status = await ShopifyService.getStoreStatus(store.id)

      return response.json({
        success: true,
        data: {
          ...store.serialize(),
          status,
        },
      })
    } catch {
      return response.status(404).json({
        error: 'No Shopify store connected',
      })
    }
  }

  /**
   * Disconnect Shopify store
   * POST /api/shopify/disconnect
   */
  async disconnect({ auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    try {
      const store = await ShopifyStore.query()
        .where('vendor_id', user.id)
        .firstOrFail()

      await ShopifyService.disconnectStore(store.id)

      return response.json({
        success: true,
        message: 'Shopify store disconnected',
      })
    } catch {
      return response.status(404).json({
        error: 'No Shopify store connected',
      })
    }
  }

  /**
   * Sync products from Shopify
   * POST /api/shopify/sync/products
   */
  async syncProducts({ auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    try {
      const store = await ShopifyStore.query()
        .where('vendor_id', user.id)
        .firstOrFail()

      if (!store.isConnected) {
        return response.status(400).json({
          error: 'Shopify store is not connected',
        })
      }

      const stats = await ShopifyService.syncProducts(store.id)

      return response.json({
        success: true,
        message: 'Products synced successfully',
        data: stats,
      })
    } catch (error) {
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to sync products',
      })
    }
  }

  /**
   * Sync orders from Shopify
   * POST /api/shopify/sync/orders
   */
  async syncOrders({ auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    try {
      const store = await ShopifyStore.query()
        .where('vendor_id', user.id)
        .firstOrFail()

      if (!store.isConnected) {
        return response.status(400).json({
          error: 'Shopify store is not connected',
        })
      }

      const stats = await ShopifyService.syncOrders(store.id)

      return response.json({
        success: true,
        message: 'Orders synced successfully',
        data: stats,
      })
    } catch (error) {
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to sync orders',
      })
    }
  }

  /**
   * List synced products
   * GET /api/shopify/products
   */
  async listProducts({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const status = request.input('status')

    try {
      const store = await ShopifyStore.query()
        .where('vendor_id', user.id)
        .firstOrFail()

      let query = ShopifyProduct.query().where('shopify_store_id', store.id)

      if (status) {
        query = query.where('status', status)
      }

      const products = await query
        .orderBy('created_at', 'desc')
        .paginate(page, limit)

      return response.json({
        success: true,
        data: products.all(),
        pagination: {
          total: products.total,
          perPage: products.perPage,
          currentPage: products.currentPage,
          lastPage: products.lastPage,
        },
      })
    } catch {
      return response.status(404).json({
        error: 'No Shopify store connected',
      })
    }
  }

  /**
   * Update product commission rates
   * PUT /api/shopify/products/:id
   */
  async updateProduct({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    try {
      const store = await ShopifyStore.query()
        .where('vendor_id', user.id)
        .firstOrFail()

      const product = await ShopifyProduct.query()
        .where('shopify_store_id', store.id)
        .where('id', params.id)
        .firstOrFail()

      const data = request.all()

      if (data.vendor_commission_rate !== undefined) {
        product.vendorCommissionRate = data.vendor_commission_rate
      }
      if (data.affiliate_commission_rate !== undefined) {
        product.affiliateCommissionRate = data.affiliate_commission_rate
      }

      await product.save()

      return response.json({
        success: true,
        message: 'Product updated',
        data: product.serialize(),
      })
    } catch {
      return response.status(404).json({
        error: 'Product not found',
      })
    }
  }

  /**
   * List synced orders
   * GET /api/shopify/orders
   */
  async listOrders({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const status = request.input('status')

    try {
      const store = await ShopifyStore.query()
        .where('vendor_id', user.id)
        .firstOrFail()

      let query = ShopifyOrder.query().where('shopify_store_id', store.id)

      if (status) {
        query = query.where('payment_status', status)
      }

      const orders = await query
        .orderBy('created_at', 'desc')
        .paginate(page, limit)

      return response.json({
        success: true,
        data: orders.all(),
        pagination: {
          total: orders.total,
          perPage: orders.perPage,
          currentPage: orders.currentPage,
          lastPage: orders.lastPage,
        },
      })
    } catch {
      return response.status(404).json({
        error: 'No Shopify store connected',
      })
    }
  }

  /**
   * Get order details
   * GET /api/shopify/orders/:id
   */
  async getOrder({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    try {
      const store = await ShopifyStore.query()
        .where('vendor_id', user.id)
        .firstOrFail()

      const order = await ShopifyOrder.query()
        .where('shopify_store_id', store.id)
        .where('id', params.id)
        .firstOrFail()

      return response.json({
        success: true,
        data: order.serialize(),
      })
    } catch {
      return response.status(404).json({
        error: 'Order not found',
      })
    }
  }

  /**
   * Calculate commissions for pending orders
   * POST /api/shopify/commissions/calculate
   */
  async calculateCommissions({ auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    try {
      const store = await ShopifyStore.query()
        .where('vendor_id', user.id)
        .firstOrFail()

      const count = await ShopifyService.calculateOrderCommissions(store.id)

      return response.json({
        success: true,
        message: `Commissions calculated for ${count} orders`,
        data: { commissionsCalculated: count },
      })
    } catch (error) {
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to calculate commissions',
      })
    }
  }

  /**
   * Get Shopify analytics
   * GET /api/shopify/analytics
   */
  async getAnalytics({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const daysBack = request.input('days', 30)

    try {
      const store = await ShopifyStore.query()
        .where('vendor_id', user.id)
        .firstOrFail()

      const startDate = DateTime.now().minus({ days: daysBack })
      const startSql = startDate.toSQL()

      const orders = await ShopifyOrder.query()
        .where('shopify_store_id', store.id)
        .where('created_at', '>=', startSql!)
        .select('*')

      const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0)
      const totalOrders = orders.length
      const paidOrders = orders.filter((o) => o.paymentStatus === 'paid').length
      const totalCommissions = orders.reduce((sum, o) => sum + (o.commissionAmount || 0), 0)

      const analytics = {
        period: `Last ${daysBack} days`,
        totalOrders,
        paidOrders,
        totalRevenue,
        totalCommissions,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        conversionRate: totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0,
        topProducts: await ShopifyProduct.query()
          .where('shopify_store_id', store.id)
          .orderBy('total_sales', 'desc')
          .limit(5)
          .select('*'),
      }

      return response.json({
        success: true,
        data: analytics,
      })
    } catch {
      return response.status(404).json({
        error: 'No Shopify store connected',
      })
    }
  }
}
