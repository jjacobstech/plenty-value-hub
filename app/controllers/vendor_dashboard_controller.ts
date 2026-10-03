import type { HttpContext } from '@adonisjs/core/http'
import VendorDashboardService from '#services/vendor_dashboard_service'

export default class VendorDashboardController {
  /**
   * Get vendor overview dashboard
   */
  async overview({ auth, response }: HttpContext) {
    const user = auth.user!

    try {
      const data = await VendorDashboardService.getOverview(user.id)
      return response.ok({ success: true, data })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch overview'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get campaigns performance list
   */
  async campaigns({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { page = 1, limit = 20 } = request.qs()

    try {
      const data = await VendorDashboardService.getCampaignsPerformance(
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
   * Get top affiliates
   */
  async topAffiliates({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { limit = 10 } = request.qs()

    try {
      const data = await VendorDashboardService.getTopAffiliates(user.id, parseInt(limit))
      return response.ok({ success: true, data })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch affiliates'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get financial summary
   */
  async financials({ auth, response }: HttpContext) {
    const user = auth.user!

    try {
      const data = await VendorDashboardService.getFinancialSummary(user.id)
      return response.ok({ success: true, data })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch financials'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get recent activity
   */
  async activity({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { limit = 20 } = request.qs()

    try {
      const data = await VendorDashboardService.getRecentActivity(user.id, parseInt(limit))
      return response.ok({ success: true, data })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch activity'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get campaign details
   */
  async campaignDetails({ params, auth, response }: HttpContext) {
    const user = auth.user!

    try {
      const data = await VendorDashboardService.getCampaignDetails(user.id, params.campaignId)
      return response.ok({ success: true, data })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Campaign not found'
      return response.notFound({ error: msg })
    }
  }

  /**
   * Get earnings breakdown
   */
  async earningsBreakdown({ auth, response }: HttpContext) {
    const user = auth.user!

    try {
      const data = await VendorDashboardService.getEarningsBreakdown(user.id)
      return response.ok({ success: true, data })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch earnings'
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
      const data = await VendorDashboardService.getTrendData(user.id, parseInt(days))
      return response.ok({ success: true, data })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch trends'
      return response.badRequest({ error: msg })
    }
  }
}
