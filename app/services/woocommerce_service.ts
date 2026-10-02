import axios, { type AxiosResponse } from 'axios'
import WoocommerceStore from '#models/woocommerce_store'
import WoocommerceProduct from '#models/woocommerce_product'
import WoocommerceOrder from '#models/woocommerce_order'
import { DateTime } from 'luxon'

export interface WoocommerceSyncStats {
  productsAdded: number
  productsUpdated: number
  ordersAdded: number
  ordersProcessed: number
  commissionsCalculated: number
  syncDuration: number
}

export default class WoocommerceService {
  /**
   * Test store connection with credentials
   */
  static async testConnection(
    storeUrl: string,
    consumerKey: string,
    consumerSecret: string
  ): Promise<boolean> {
    try {
      const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')

      await axios.get(`${storeUrl}/wp-json/wc/v3/system_status`, {
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      })

      return true
    } catch {
      return false
    }
  }

  /**
   * Create WooCommerce store connection
   */
  static async createStoreConnection(
    vendorId: number,
    storeUrl: string,
    consumerKey: string,
    consumerSecret: string
  ): Promise<WoocommerceStore> {
    const isValid = await this.testConnection(storeUrl, consumerKey, consumerSecret)
    if (!isValid) {
      throw new Error('Invalid WooCommerce credentials')
    }

    // Get store info
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')
    const response = await axios.get(`${storeUrl}/wp-json/wc/v3/settings/general`, {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    })

    const settings = response.data
    const currency = settings.find((s: any) => s.id === 'woocommerce_currency')?.value || 'USD'

    return WoocommerceStore.create({
      vendorId,
      storeName: storeUrl.split('//')[1]?.split('.')[0] || 'Unknown',
      storeUrl: storeUrl.replace(/\/$/, ''),
      consumerKey,
      consumerSecret,
      isConnected: true,
      connectionStatus: 'connected',
      connectedAt: DateTime.now(),
      currency,
      totalProducts: 0,
      totalOrders: 0,
    })
  }

  /**
   * Sync products from WooCommerce
   */
  static async syncProducts(storeId: number): Promise<WoocommerceSyncStats> {
    const store = await WoocommerceStore.findOrFail(storeId)
    const startTime = DateTime.now()
    const auth = Buffer.from(`${store.consumerKey}:${store.consumerSecret}`).toString('base64')

    let productsAdded = 0
    let productsUpdated = 0
    let page = 1
    let hasMore = true

    try {
      while (hasMore) {
        const response: AxiosResponse<any> = await axios.get(
          `${store.storeUrl}/wp-json/wc/v3/products?page=${page}&per_page=100`,
          {
            headers: {
              'Authorization': `Basic ${auth}`,
            },
          }
        )

        const products: any[] = response.data
        hasMore = products.length === 100

        for (const product of products) {
          const existing = await WoocommerceProduct.query()
            .where('woocommerceStoreId', storeId)
            .where('wooProductId', product.id)
            .first()

          if (existing) {
            existing.title = product.name
            existing.description = product.description
            existing.sku = product.sku
            existing.price = parseFloat(product.price)
            existing.regularPrice = product.regular_price ? parseFloat(product.regular_price) : null
            existing.salePrice = product.sale_price ? parseFloat(product.sale_price) : null
            existing.stockQty = product.stock_quantity || 0
            existing.imageUrl = product.images?.[0]?.src
            existing.productUrl = product.permalink
            existing.status = product.status
            existing.syncStatus = 'synced'
            existing.lastSyncedAt = DateTime.now()

            if (product.categories && product.categories.length > 0) {
              existing.categories = JSON.stringify(product.categories.map((c: any) => c.id))
            }
            if (product.tags && product.tags.length > 0) {
              existing.tags = JSON.stringify(product.tags.map((t: any) => t.name))
            }

            await existing.save()
            productsUpdated++
          } else {
            await WoocommerceProduct.create({
              woocommerceStoreId: storeId,
              wooProductId: product.id,
              title: product.name,
              description: product.description,
              sku: product.sku,
              price: parseFloat(product.price),
              regularPrice: product.regular_price ? parseFloat(product.regular_price) : null,
              salePrice: product.sale_price ? parseFloat(product.sale_price) : null,
              currency: store.currency,
              stockQty: product.stock_quantity || 0,
              imageUrl: product.images?.[0]?.src,
              productUrl: product.permalink,
              status: product.status,
              syncStatus: 'synced',
              lastSyncedAt: DateTime.now(),
              vendorCommissionRate: 0,
              affiliateCommissionRate: 0,
              categories: JSON.stringify(product.categories?.map((c: any) => c.id) || []),
              tags: JSON.stringify(product.tags?.map((t: any) => t.name) || []),
            })
            productsAdded++
          }
        }

        page++
      }

      store.totalProducts = await WoocommerceProduct.query()
        .where('woocommerceStoreId', storeId)
        .count('*', 'count')
        .then((r) => parseInt((r[0] as any)?.count || '0'))
      store.lastProductSyncAt = DateTime.now()
      await store.save()

      return {
        productsAdded,
        productsUpdated,
        ordersAdded: 0,
        ordersProcessed: 0,
        commissionsCalculated: 0,
        syncDuration: DateTime.now().diff(startTime, 'milliseconds').milliseconds,
      }
    } catch (error) {
      store.connectionStatus = 'error'
      store.lastErrorAt = DateTime.now()
      store.lastErrorMessage = error instanceof Error ? error.message : 'Unknown error'
      await store.save()

      throw error
    }
  }

  /**
   * Sync orders from WooCommerce
   */
  static async syncOrders(storeId: number): Promise<WoocommerceSyncStats> {
    const store = await WoocommerceStore.findOrFail(storeId)
    const startTime = DateTime.now()
    const auth = Buffer.from(`${store.consumerKey}:${store.consumerSecret}`).toString('base64')

    let ordersAdded = 0
    let ordersProcessed = 0
    let commissionsCalculated = 0
    let page = 1
    let hasMore = true

    try {
      while (hasMore) {
        const response: AxiosResponse<any> = await axios.get(
          `${store.storeUrl}/wp-json/wc/v3/orders?page=${page}&per_page=100&status=any`,
          {
            headers: {
              'Authorization': `Basic ${auth}`,
            },
          }
        )

        const orders: any[] = response.data
        hasMore = orders.length === 100

        for (const order of orders) {
          const existing = await WoocommerceOrder.query()
            .where('woocommerceStoreId', storeId)
            .where('wooOrderId', order.id)
            .first()

          if (!existing) {
            const lineItems = order.line_items.map((item: any) => ({
              product_id: item.product_id,
              quantity: item.quantity,
              price: parseFloat(item.price),
            }))

            await WoocommerceOrder.create({
              woocommerceStoreId: storeId,
              wooOrderId: order.id,
              orderNumber: `#${order.order_number || order.id}`,
              customerEmail: order.billing.email,
              customerName: `${order.billing.first_name} ${order.billing.last_name}`.trim(),
              currency: order.currency,
              totalPrice: parseFloat(order.total),
              subtotalPrice: parseFloat(order.subtotal),
              taxPrice: parseFloat(order.total_tax),
              shippingPrice: parseFloat(order.shipping_total),
              discountAmount: parseFloat(order.discount_total),
              status: order.status,
              paymentMethod: order.payment_method_title,
              paymentStatus: order.date_paid ? 'paid' : 'pending',
              lineItems: JSON.stringify(lineItems),
              shippingAddress: JSON.stringify(order.shipping),
              billingAddress: JSON.stringify(order.billing),
              notes: order.customer_note,
              orderedAt: DateTime.fromISO(order.date_created),
            })

            ordersAdded++
            ordersProcessed++
          } else {
            ordersProcessed++
          }
        }

        page++
      }

      store.totalOrders = await WoocommerceOrder.query()
        .where('woocommerceStoreId', storeId)
        .count('*', 'count')
        .then((r) => parseInt((r[0] as any)?.count || '0'))
      store.lastOrderSyncAt = DateTime.now()
      await store.save()

      return {
        productsAdded: 0,
        productsUpdated: 0,
        ordersAdded,
        ordersProcessed,
        commissionsCalculated,
        syncDuration: DateTime.now().diff(startTime, 'milliseconds').milliseconds,
      }
    } catch (error) {
      store.connectionStatus = 'error'
      store.lastErrorAt = DateTime.now()
      store.lastErrorMessage = error instanceof Error ? error.message : 'Unknown error'
      await store.save()

      throw error
    }
  }

  /**
   * Calculate commissions for WooCommerce orders
   */
  static async calculateOrderCommissions(storeId: number): Promise<number> {
    let commissionsCalculated = 0

    const orders = await WoocommerceOrder.query()
      .where('woocommerceStoreId', storeId)
      .where('commission_calculated', false)
      .where('payment_status', 'paid')
      .select('*')

    for (const order of orders) {
      if (order.affiliateLinkUsed && order.affiliateId && order.campaignId) {
        const lineItems = JSON.parse(order.lineItems)
        let totalCommission = 0

        for (const item of lineItems) {
          const product = await WoocommerceProduct.query()
            .where('woocommerceStoreId', storeId)
            .where('wooProductId', item.product_id)
            .first()

          if (product) {
            const itemTotal = item.price * item.quantity
            const commission = (itemTotal * product.affiliateCommissionRate) / 100
            totalCommission += commission
          }
        }

        order.commissionAmount = totalCommission
        order.affiliateCommissionAmount = totalCommission
        order.commissionCalculated = true
        order.commissionStatus = 'pending'

        await order.save()
        commissionsCalculated++
      }
    }

    return commissionsCalculated
  }

  /**
   * Disconnect WooCommerce store
   */
  static async disconnectStore(storeId: number): Promise<void> {
    const store = await WoocommerceStore.findOrFail(storeId)

    store.isConnected = false
    store.connectionStatus = 'disconnected'
    store.disconnectedAt = DateTime.now()
    store.consumerKey = ''
    store.consumerSecret = ''

    await store.save()
  }

  /**
   * Get store sync status
   */
  static async getStoreStatus(storeId: number): Promise<any> {
    const store = await WoocommerceStore.findOrFail(storeId)

    const productCount = await WoocommerceProduct.query()
      .where('woocommerceStoreId', storeId)
      .count('*', 'count')
      .then((r) => parseInt((r[0] as any)?.count || '0'))

    const orderCount = await WoocommerceOrder.query()
      .where('woocommerceStoreId', storeId)
      .count('*', 'count')
      .then((r) => parseInt((r[0] as any)?.count || '0'))

    const totalRevenue = await WoocommerceOrder.query()
      .where('woocommerceStoreId', storeId)
      .sum('total_price', 'total')
      .then((r) => parseFloat((r[0] as any)?.total || '0'))

    return {
      id: store.id,
      storeName: store.storeName,
      storeUrl: store.storeUrl,
      isConnected: store.isConnected,
      connectionStatus: store.connectionStatus,
      lastSyncAt: store.lastSyncAt,
      lastProductSyncAt: store.lastProductSyncAt,
      lastOrderSyncAt: store.lastOrderSyncAt,
      productCount,
      orderCount,
      totalRevenue,
      lastError: store.lastErrorMessage,
      lastErrorAt: store.lastErrorAt,
    }
  }
}
