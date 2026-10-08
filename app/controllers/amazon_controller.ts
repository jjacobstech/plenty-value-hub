import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import AmazonStore from '#models/amazon_store'

export default class AmazonController {
  /**
   * Get OAuth authorization URL for Amazon PA
   * GET /api/amazon/auth-url
   */
  async getAuthUrl({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user

    if (!user || user.role !== 'vendor') {
      return response.status(403).json({ error: 'Only vendors can connect Amazon accounts' })
    }

    const sellerId = request.input('seller_id')
    if (!sellerId) {
      return response.status(400).json({ error: 'Seller ID required' })
    }

    const apiKey = process.env.AMAZON_API_KEY
    const redirectUri = `${process.env.APP_URL}/api/amazon/callback`

    if (!apiKey) {
      return response.status(400).json({
        error: 'Amazon API key not configured',
      })
    }

    const scope = encodeURIComponent('advertising:campaign_management advertising:report_view')
    const state = Buffer.from(JSON.stringify({ userId: user.id, sellerId, timestamp: Date.now() })).toString('base64')

    const authUrl = `https://api-northeastern.amazon.com/auth?client_id=${apiKey}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}&response_type=code`

    return response.redirect(authUrl)
  }

  /**
   * Amazon OAuth callback
   * GET /api/amazon/callback
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
      return response.status(400).redirect(`/vendor/integrations?error=amazon_auth_failed&details=${error}`)
    }

    if (!code || !state) {
      return response.status(400).redirect(`/vendor/integrations?error=missing_params`)
    }

    try {
      const decodedState = JSON.parse(Buffer.from(state, 'base64').toString())
      if (decodedState.userId !== user.id) {
        return response.status(403).json({ error: 'State mismatch' })
      }

      const sellerId = decodedState.sellerId
      if (!sellerId) {
        return response.status(400).json({ error: 'Seller ID not found in state' })
      }

      // Mock token exchange - in production, exchange code for access token with Amazon API
      const accessToken = `amazon_access_${user.id}_${Date.now()}`
      const refreshToken = `amazon_refresh_${user.id}_${Date.now()}`

      // Check if store already exists
      let store = await AmazonStore.findBy('vendor_id', user.id)

      if (store) {
        store.merge({
          sellerId,
          accessToken,
          refreshToken,
          isConnected: true,
          connectionStatus: 'connected',
          connectedAt: DateTime.now(),
        })
      } else {
        store = new AmazonStore()
        store.merge({
          vendorId: user.id,
          sellerId,
          accessToken,
          refreshToken,
          isConnected: true,
          connectionStatus: 'connected',
          connectedAt: DateTime.now(),
        })
      }

      await store.save()

      return response.redirect(`/vendor/integrations?success=amazon_connected`)
    } catch (error) {
      console.error('[AmazonController] OAuth callback error:', error)
      return response.status(400).redirect(
        `/vendor/integrations?error=connection_failed&details=${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * List connected Amazon PA accounts
   * GET /api/amazon/accounts
   */
  async listAccounts({ auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    return response.json({
      success: true,
      data: [],
      message: 'No Amazon accounts connected yet',
    })
  }

  /**
   * Get Amazon campaigns and metrics
   * GET /api/amazon/campaigns
   */
  async getCampaigns({ auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    return response.json({
      success: true,
      data: {
        campaigns: [],
        totalSpend: 0,
        totalSales: 0,
        roi: 0,
      },
    })
  }
}
