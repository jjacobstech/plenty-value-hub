import WoocommerceStore from '#models/woocommerce_store'
import WoocommerceProduct from '#models/woocommerce_product'
import WoocommerceOrder from '#models/woocommerce_order'
import WoocommerceService from '#services/woocommerce_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class WoocommerceController {
  /**
   * Connect WooCommerce store
   * POST /api/woocommerce/connect
   */
  async connect({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Only vendors can connect WooCommerce stores' })
    }

    const storeUrl = request.input('store_url')
    const consumerKey = request.input('consumer_key')
    const consumerSecret = request.input('consumer_secret')

    if (!storeUrl || !consumerKey || !consumerSecret) {
      return response.status(400).json({
        error: 'Missing required fields: store_url, consumer_key, consumer_secret',
      })
    }

    try {
      const store = await WoocommerceService.createStoreConnection(
        user.id,
        storeUrl,
        consumerKey,
        consumerSecret
      )

      return response.status(201).json({
        success: true,
        message: 'WooCommerce store connected',
        data: store.serialize(),
      })
    } catch (error) {
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to connect store',
      })
    }
  }

  /**
   * Get connected WooCommerce store
   * GET /api/woocommerce/store
   */
  async getStore({ auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    try {
      const store = await WoocommerceStore.query()
        .where('vendor_id', user.id)
        .firstOrFail()

      const status = await WoocommerceService.getStoreStatus(store.id)

      return response.json({
        success: true,
        data: {
          ...store.serialize(),
          status,
        },
      })
    } catch {
      return response.status(404).json({
        error: 'No WooCommerce store connected',
      })
    }
  }

  /**
   * Disconnect WooCommerce store
   * POST /api/woocommerce/disconnect
   */
  async disconnect({ auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    try {
      const store = await WoocommerceStore.query()
        .where('vendor_id', user.id)
        .firstOrFail()

      await WoocommerceService.disconnectStore(store.id)

      return response.json({
        success: true,
        message: 'WooCommerce store disconnected',
      })
    } catch {
      return response.status(404).json({
        error: 'No WooCommerce store connected',
      })
    }
  }

  /**
   * Sync products from WooCommerce
   * POST /api/woocommerce/sync/products
   */
  async syncProducts({ auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    try {
      const store = await WoocommerceStore.query()
        .where('vendor_id', user.id)
        .firstOrFail()

      if (!store.isConnected) {
        return response.status(400).json({
          error: 'WooCommerce store is not connected',
        })
      }

      const stats = await WoocommerceService.syncProducts(store.id)

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
   * Sync orders from WooCommerce
   * POST /api/woocommerce/sync/orders
   */
  async syncOrders({ auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    try {
      const store = await WoocommerceStore.query()
        .where('vendor_id', user.id)
        .firstOrFail()

      if (!store.isConnected) {
        return response.status(400).json({
          error: 'WooCommerce store is not connected',
        })
      }

      const stats = await WoocommerceService.syncOrders(store.id)

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
   * GET /api/woocommerce/products
   */
  async listProducts({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    try {
      const store = await WoocommerceStore.query()
        .where('vendor_id', user.id)
        .firstOrFail()

      const products = await WoocommerceProduct.query()
        .where('woocommerceStoreId', store.id)
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
        error: 'No WooCommerce store connected',
      })
    }
  }

  /**
   * Update product commission rates
   * PUT /api/woocommerce/products/:id
   */
  async updateProduct({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    try {
      const store = await WoocommerceStore.query()
        .where('vendor_id', user.id)
        .firstOrFail()

      const product = await WoocommerceProduct.query()
        .where('woocommerceStoreId', store.id)
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
   * GET /api/woocommerce/orders
   */
  async listOrders({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    try {
      const store = await WoocommerceStore.query()
        .where('vendor_id', user.id)
        .firstOrFail()

      const orders = await WoocommerceOrder.query()
        .where('woocommerceStoreId', store.id)
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
        error: 'No WooCommerce store connected',
      })
    }
  }

  /**
   * Calculate commissions for pending orders
   * POST /api/woocommerce/commissions/calculate
   */
  async calculateCommissions({ auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    try {
      const store = await WoocommerceStore.query()
        .where('vendor_id', user.id)
        .firstOrFail()

      const count = await WoocommerceService.calculateOrderCommissions(store.id)

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
   * Get WooCommerce analytics
   * GET /api/woocommerce/analytics
   */
  async getAnalytics({ auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    try {
      const store = await WoocommerceStore.query()
        .where('vendor_id', user.id)
        .firstOrFail()

      const orders = await WoocommerceOrder.query()
        .where('woocommerceStoreId', store.id)
        .select('*')

      const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0)
      const totalOrders = orders.length
      const paidOrders = orders.filter((o) => o.paymentStatus === 'paid').length
      const totalCommissions = orders.reduce((sum, o) => sum + (o.commissionAmount || 0), 0)

      const analytics = {
        totalOrders,
        paidOrders,
        totalRevenue,
        totalCommissions,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        conversionRate: totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0,
      }

      return response.json({
        success: true,
        data: analytics,
      })
    } catch {
      return response.status(404).json({
        error: 'No WooCommerce store connected',
      })
    }
  }
}
