import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import EtsyShop from '#models/etsy_shop'

export default class EtsyController {
  /**
   * Get OAuth authorization URL for Etsy
   * GET /api/etsy/auth-url
   */
  async getAuthUrl({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user

    if (!user || user.role !== 'vendor') {
      return response.status(403).json({ error: 'Only vendors can connect Etsy shops' })
    }

    const shopUrl = request.input('shop_url')
    if (!shopUrl) {
      return response.status(400).json({ error: 'Shop URL required' })
    }

    const clientId = process.env.ETSY_CLIENT_ID
    const redirectUri = `${process.env.APP_URL}/api/etsy/callback`

    if (!clientId) {
      return response.status(400).json({
        error: 'Etsy client ID not configured',
      })
    }

    const scopes = [
      'shops:read',
      'listings:read',
      'listings:write',
      'orders:read',
      'transactions:read',
    ].join(' ')

    const state = Buffer.from(JSON.stringify({ userId: user.id, shopUrl, timestamp: Date.now() })).toString('base64')

    const authUrl = `https://www.etsy.com/oauth/connect?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}`

    return response.redirect(authUrl)
  }

  /**
   * Etsy OAuth callback
   * GET /api/etsy/callback
   */
  async handleCallback({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const code = request.input('code')
    const state = request.input('state')
    const error = request.input('error')

    if (error) {
      return response.status(400).redirect(`/vendor/integrations?error=etsy_auth_failed&details=${error}`)
    }

    if (!code || !state) {
      return response.status(400).redirect(`/vendor/integrations?error=missing_params`)
    }

    try {
      const decodedState = JSON.parse(Buffer.from(state, 'base64').toString())
      if (decodedState.userId !== user.id) {
        return response.status(403).json({ error: 'State mismatch' })
      }

      const shopUrl = decodedState.shopUrl
      if (!shopUrl) {
        return response.status(400).json({ error: 'Shop URL not found in state' })
      }

      // Mock token exchange - in production, exchange code for access token with Etsy API
      const accessToken = `etsy_access_${user.id}_${Date.now()}`
      const refreshToken = `etsy_refresh_${user.id}_${Date.now()}`
      const shopId = `shop_${user.id}_${Date.now()}` // Mock shop ID

      // Check if shop already exists
      let shop = await EtsyShop.findBy('vendor_id', user.id)

      if (shop) {
        shop.merge({
          shopUrl,
          shopId,
          accessToken,
          refreshToken,
          isConnected: true,
          connectionStatus: 'connected',
          connectedAt: DateTime.now(),
        })
      } else {
        shop = new EtsyShop()
        shop.merge({
          vendorId: user.id,
          shopUrl,
          shopId,
          shopName: shopUrl.split('/').pop() || 'My Shop',
          accessToken,
          refreshToken,
          isConnected: true,
          connectionStatus: 'connected',
          connectedAt: DateTime.now(),
        })
      }

      await shop.save()

      return response.redirect(`/vendor/integrations?success=etsy_connected`)
    } catch (error) {
      console.error('[EtsyController] OAuth callback error:', error)
      return response.status(400).redirect(
        `/vendor/integrations?error=connection_failed&details=${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * List connected Etsy shops
   * GET /api/etsy/shops
   */
  async listShops({ auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    return response.json({
      success: true,
      data: [],
      message: 'No Etsy shops connected yet',
    })
  }

  /**
   * Get Etsy listings and metrics
   * GET /api/etsy/listings
   */
  async getListings({ auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    return response.json({
      success: true,
      data: {
        listings: [],
        totalListings: 0,
        activeListings: 0,
        totalSales: 0,
      },
    })
  }

  /**
   * Get Etsy orders and revenue
   * GET /api/etsy/orders
   */
  async getOrders({ auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    return response.json({
      success: true,
      data: {
        orders: [],
        totalOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
      },
    })
  }
}
