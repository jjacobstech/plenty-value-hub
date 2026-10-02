import axios, { type AxiosResponse } from 'axios'
import ShopifyStore from '#models/shopify_store'
import ShopifyProduct from '#models/shopify_product'
import ShopifyOrder from '#models/shopify_order'
import { DateTime } from 'luxon'

export interface ShopifySyncStats {
  productsAdded: number
  productsUpdated: number
  ordersAdded: number
  ordersProcessed: number
  commissionsCalculated: number
  syncDuration: number
}

export default class ShopifyService {
  /**
   * Get OAuth authorization URL
   */
  static getOAuthUrl(shopDomain: string, apiKey: string, redirectUri: string, scopes: string[]): string {
    const scope = scopes.join(',')
    return `https://${shopDomain}/admin/oauth/authorize?client_id=${apiKey}&scope=${scope}&redirect_uri=${redirectUri}`
  }

  /**
   * Exchange authorization code for access token
   */
  static async exchangeAuthCode(
    shopDomain: string,
    code: string,
    apiKey: string,
    apiSecret: string
  ): Promise<{ accessToken: string; refreshToken?: string }> {
    try {
      const response = await axios.post(
        `https://${shopDomain}/admin/oauth/access_token`,
        {
          client_id: apiKey,
          client_secret: apiSecret,
          code,
        }
      )

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
      }
    } catch (error) {
      throw new Error(`Failed to exchange auth code: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Create Shopify store connection
   */
  static async createStoreConnection(
    vendorId: number,
    shopDomain: string,
    accessToken: string,
    apiVersion: string = '2024-01'
  ): Promise<ShopifyStore> {
    // Get shop info to verify connection and get shop name
    const shopInfo = await this.getShopInfo(shopDomain, accessToken, apiVersion)

    return ShopifyStore.create({
      vendorId,
      shopName: shopInfo.name,
      shopDomain,
      accessToken,
      apiVersion,
      scopes: JSON.stringify([
        'read_products',
        'read_orders',
        'read_fulfillments',
        'read_customers',
      ]),
      isConnected: true,
      connectionStatus: 'connected',
      connectedAt: DateTime.now(),
      currency: shopInfo.currency,
      totalProducts: 0,
      totalOrders: 0,
    })
  }

  /**
   * Get shop info from Shopify API
   */
  private static async getShopInfo(
    shopDomain: string,
    accessToken: string,
    apiVersion: string
  ): Promise<any> {
    const response = await axios.get(
      `https://${shopDomain}/admin/api/${apiVersion}/shop.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
        },
      }
    )

    return response.data.shop
  }

  /**
   * Sync products from Shopify
   */
  static async syncProducts(storeId: number): Promise<ShopifySyncStats> {
    const store = await ShopifyStore.findOrFail(storeId)
    const startTime = DateTime.now()

    let productsAdded = 0
    let productsUpdated = 0

    try {
      let cursor: string | null = null
      let hasNextPage = true

      while (hasNextPage) {
        const query = `
          query($first: Int!, $after: String) {
            products(first: 250, after: $after) {
              pageInfo { hasNextPage }
              edges {
                cursor
                node {
                  id
                  title
                  description
                  handle
                  priceRange { minVariantPrice { amount } }
                  variants(first: 1) {
                    edges {
                      node {
                        id
                        sku
                        price
                        compareAtPrice
                        inventoryQuantity
                      }
                    }
                  }
                  images(first: 1) {
                    edges {
                      node { url }
                    }
                  }
                }
              }
            }
          }
        `

        const response: AxiosResponse<any> = await axios.post(
          `https://${store.shopDomain}/admin/api/${store.apiVersion}/graphql.json`,
          { query, variables: { first: 250, after: cursor } },
          {
            headers: {
              'X-Shopify-Access-Token': store.accessToken,
              'Content-Type': 'application/json',
            },
          }
        )

        const products: any = response.data.data.products
        hasNextPage = products.pageInfo.hasNextPage

        for (const edge of products.edges) {
          const product: any = edge.node
          const variant = product.variants.edges[0]?.node
          const image = product.images.edges[0]?.node

          const shopifyProductId = product.id.split('/').pop()
          const shopifyVariantId = variant?.id.split('/').pop()

          const existing = await ShopifyProduct.query()
            .where('shopifyStoreId', storeId)
            .where('shopifyProductId', shopifyProductId)
            .first()

          if (existing) {
            existing.title = product.title
            existing.description = product.description
            existing.sku = variant?.sku
            existing.price = parseFloat(variant?.price || 0)
            existing.compareAtPrice = variant?.compareAtPrice ? parseFloat(variant.compareAtPrice) : null
            existing.inventoryQty = variant?.inventoryQuantity || 0
            existing.imageUrl = image?.url
            existing.shopifyVariantId = shopifyVariantId
            existing.status = 'active'
            existing.syncStatus = 'synced'
            existing.lastSyncedAt = DateTime.now()

            await existing.save()
            productsUpdated++
          } else {
            await ShopifyProduct.create({
              shopifyStoreId: storeId,
              shopifyProductId,
              shopifyVariantId,
              title: product.title,
              description: product.description,
              sku: variant?.sku,
              price: parseFloat(variant?.price || 0),
              compareAtPrice: variant?.compareAtPrice ? parseFloat(variant.compareAtPrice) : null,
              currency: store.currency,
              inventoryQty: variant?.inventoryQuantity || 0,
              imageUrl: image?.url,
              shopifyUrl: `https://${store.shopDomain}/products/${product.handle}`,
              status: 'active',
              syncStatus: 'synced',
              lastSyncedAt: DateTime.now(),
              vendorCommissionRate: 0,
              affiliateCommissionRate: 0,
            })
            productsAdded++
          }

          cursor = edge.cursor
        }
      }

      store.totalProducts = await ShopifyProduct.query()
        .where('shopifyStoreId', storeId)
        .count('*', 'count')
        .then((r) => parseInt((r[0] as any)?.count || '0'))
      store.lastSyncAt = DateTime.now()
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
   * Sync orders from Shopify
   */
  static async syncOrders(storeId: number): Promise<ShopifySyncStats> {
    const store = await ShopifyStore.findOrFail(storeId)
    const startTime = DateTime.now()

    let ordersAdded = 0
    let ordersProcessed = 0
    let commissionsCalculated = 0

    try {
      const sinceDatetime = store.lastOrderSyncAt
        ? store.lastOrderSyncAt.toISO()
        : DateTime.now().minus({ days: 30 }).toISO()

      let cursor: string | null = null
      let hasNextPage = true

      while (hasNextPage) {
        const query = `
          query($first: Int!, $after: String, $query: String) {
            orders(first: 100, after: $after, query: $query) {
              pageInfo { hasNextPage }
              edges {
                cursor
                node {
                  id
                  orderNumber
                  email
                  customer { firstName lastName }
                  currencyCode
                  totalPriceSet { shopMoney { amount } }
                  subtotalPriceSet { shopMoney { amount } }
                  totalTaxSet { shopMoney { amount } }
                  totalShippingPriceSet { shopMoney { amount } }
                  totalDiscountsSet { shopMoney { amount } }
                  fulfillmentStatus
                  displayFinancialStatus
                  lineItems(first: 100) {
                    edges {
                      node {
                        id
                        product { id }
                        variant { id }
                        quantity
                        originalUnitPriceSet { shopMoney { amount } }
                      }
                    }
                  }
                  shippingAddress { formatted }
                  billingAddress { formatted }
                  createdAt
                }
              }
            }
          }
        `

        const response: AxiosResponse<any> = await axios.post(
          `https://${store.shopDomain}/admin/api/${store.apiVersion}/graphql.json`,
          {
            query,
            variables: {
              first: 100,
              after: cursor,
              query: `created:>='${sinceDatetime}' AND financial_status:paid`,
            },
          },
          {
            headers: {
              'X-Shopify-Access-Token': store.accessToken,
              'Content-Type': 'application/json',
            },
          }
        )

        const orders: any = response.data.data.orders
        hasNextPage = orders.pageInfo.hasNextPage

        for (const edge of orders.edges) {
          const order: any = edge.node
          const shopifyOrderId = order.id.split('/').pop()

          const existing = await ShopifyOrder.query()
            .where('shopifyStoreId', storeId)
            .where('shopifyOrderId', shopifyOrderId)
            .first()

          if (!existing) {
            const lineItems = order.lineItems.edges.map((item: any) => ({
              product_id: item.node.product?.id.split('/').pop(),
              variant_id: item.node.variant?.id.split('/').pop(),
              quantity: item.node.quantity,
              price: parseFloat(item.node.originalUnitPriceSet.shopMoney.amount),
            }))

            await ShopifyOrder.create({
              shopifyStoreId: storeId,
              shopifyOrderId,
              orderNumber: `#${order.orderNumber}`,
              customerEmail: order.email,
              customerName: order.customer
                ? `${order.customer.firstName} ${order.customer.lastName}`
                : null,
              currency: order.currencyCode,
              totalPrice: parseFloat(order.totalPriceSet.shopMoney.amount),
              subtotalPrice: parseFloat(order.subtotalPriceSet.shopMoney.amount),
              taxPrice: parseFloat(order.totalTaxSet.shopMoney.amount),
              shippingPrice: parseFloat(order.totalShippingPriceSet.shopMoney.amount),
              discountAmount: parseFloat(order.totalDiscountsSet.shopMoney.amount),
              fulfillmentStatus: (order.fulfillmentStatus || 'pending').toLowerCase(),
              financialStatus: (order.displayFinancialStatus || 'pending').toLowerCase(),
              paymentStatus: order.displayFinancialStatus === 'Paid' ? 'paid' : 'pending',
              lineItems: JSON.stringify(lineItems),
              orderedAt: DateTime.fromISO(order.createdAt),
            })

            ordersAdded++
            ordersProcessed++
          } else {
            ordersProcessed++
          }

          cursor = edge.cursor
        }
      }

      store.totalOrders = await ShopifyOrder.query()
        .where('shopifyStoreId', storeId)
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
   * Calculate commissions for Shopify orders
   */
  static async calculateOrderCommissions(storeId: number): Promise<number> {
    let commissionsCalculated = 0

    const orders = await ShopifyOrder.query()
      .where('shopifyStoreId', storeId)
      .where('commission_calculated', false)
      .where('payment_status', 'paid')
      .select('*')

    for (const order of orders) {
      if (order.affiliateLinkUsed && order.affiliateId && order.campaignId) {
        const lineItems = JSON.parse(order.lineItems)
        let totalCommission = 0

        for (const item of lineItems) {
          const product = await ShopifyProduct.query()
            .where('shopifyStoreId', storeId)
            .where('shopifyProductId', item.product_id)
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
   * Disconnect Shopify store
   */
  static async disconnectStore(storeId: number): Promise<void> {
    const store = await ShopifyStore.findOrFail(storeId)

    store.isConnected = false
    store.connectionStatus = 'disconnected'
    store.disconnectedAt = DateTime.now()
    store.accessToken = ''

    await store.save()
  }

  /**
   * Get store sync status
   */
  static async getStoreStatus(storeId: number): Promise<any> {
    const store = await ShopifyStore.findOrFail(storeId)

    const productCount = await ShopifyProduct.query()
      .where('shopifyStoreId', storeId)
      .count('*', 'count')
      .then((r) => parseInt((r[0] as any)?.count || '0'))

    const orderCount = await ShopifyOrder.query()
      .where('shopifyStoreId', storeId)
      .count('*', 'count')
      .then((r) => parseInt((r[0] as any)?.count || '0'))

    const totalRevenue = await ShopifyOrder.query()
      .where('shopifyStoreId', storeId)
      .sum('total_price', 'total')
      .then((r) => parseFloat((r[0] as any)?.total || '0'))

    return {
      id: store.id,
      shopName: store.shopName,
      shopDomain: store.shopDomain,
      isConnected: store.isConnected,
      connectionStatus: store.connectionStatus,
      lastSyncAt: store.lastSyncAt,
      lastOrderSyncAt: store.lastOrderSyncAt,
      productCount,
      orderCount,
      totalRevenue,
      lastError: store.lastErrorMessage,
      lastErrorAt: store.lastErrorAt,
    }
  }
}
