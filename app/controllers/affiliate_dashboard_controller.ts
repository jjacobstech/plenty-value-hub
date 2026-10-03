import type { HttpContext } from '@adonisjs/core/http'
import AffiliateDashboardService from '#services/affiliate_dashboard_service'

export default class AffiliateDashboardController {
  /**
   * Get affiliate overview
   */
  async overview({ auth, response }: HttpContext) {
    const user = auth.user!

    try {
      const data = await AffiliateDashboardService.getOverview(user.id)
      return response.ok({ success: true, data })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch overview'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get affiliate links performance
   */
  async links({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { page = 1, limit = 20 } = request.qs()

    try {
      const data = await AffiliateDashboardService.getLinksPerformance(
        user.id,
        page,
        limit
      )
      return response.ok({ success: true, data })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch links'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get available campaigns
   */
  async availableCampaigns({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { page = 1, limit = 20 } = request.qs()

    try {
      const data = await AffiliateDashboardService.getAvailableCampaigns(
        user.id,
        page,
        limit
      )
      return response.ok({ success: true, data })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch campaigns'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get commissions
   */
  async commissions({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { status, page = 1, limit = 20 } = request.qs()

    try {
      const data = await AffiliateDashboardService.getCommissions(
        user.id,
        status,
        page,
        limit
      )
      return response.ok({ success: true, data })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch commissions'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get payouts
   */
  async payouts({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { status, page = 1, limit = 20 } = request.qs()

    try {
      const data = await AffiliateDashboardService.getPayouts(
        user.id,
        status,
        page,
        limit
      )
      return response.ok({ success: true, data })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch payouts'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get earnings breakdown
   */
  async earningsBreakdown({ auth, response }: HttpContext) {
    const user = auth.user!

    try {
      const data = await AffiliateDashboardService.getEarningsBreakdown(user.id)
      return response.ok({ success: true, data })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch earnings'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get trending links
   */
  async trending({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { limit = 5 } = request.qs()

    try {
      const data = await AffiliateDashboardService.getTrendingLinks(user.id, parseInt(limit))
      return response.ok({ success: true, data })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch trending links'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get trend data
   */
  async trends({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { days = 30 } = request.qs()

    try {
      const data = await AffiliateDashboardService.getTrendData(user.id, parseInt(days))
      return response.ok({ success: true, data })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch trends'
      return response.badRequest({ error: msg })
    }
  }
}
