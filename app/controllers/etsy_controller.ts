import type { HttpContext } from '@adonisjs/core/http'

export default class EtsyController {
  /**
   * Get OAuth authorization URL for Etsy
   * GET /api/etsy/auth-url
   */
  async getAuthUrl({ auth, response }: HttpContext) {
    const user = auth.use('web').user

    if (!user || user.role !== 'vendor') {
      return response.status(403).json({ error: 'Only vendors can connect Etsy shops' })
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
    ].join(',')

    const state = Buffer.from(JSON.stringify({ userId: user.id, timestamp: Date.now() })).toString('base64')

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

    if (!code || !state) {
      return response.status(400).json({
        error: 'Missing authorization code or state',
      })
    }

    try {
      // For now, return success response
      // In Phase 2, implement actual token exchange with Etsy API
      return response.json({
        success: true,
        message: 'Etsy shop connected',
        data: {
          vendor_id: user.id,
          platform: 'etsy',
          connected: true,
        },
      })
    } catch (error) {
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to connect shop',
      })
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
