import type { HttpContext } from '@adonisjs/core/http'
import AdminDashboardService from '#services/admin_dashboard_service'

export default class AdminDashboardController {
  /**
   * Get admin overview (admin only)
   */
  async overview({ auth, response }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'admin') {
      return response.unauthorized({ error: 'Only admins can access this' })
    }

    try {
      const data = await AdminDashboardService.getOverview()
      return response.ok({ success: true, data })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch overview'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get pending campaigns for approval
   */
  async pendingCampaigns({ auth, request, response }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'admin') {
      return response.unauthorized({ error: 'Only admins can access this' })
    }

    const { page = 1, limit = 20 } = request.qs()

    try {
      const data = await AdminDashboardService.getPendingCampaigns(page, limit)
      return response.ok({ success: true, data })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch campaigns'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get recent conversions
   */
  async recentConversions({ auth, request, response }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'admin') {
      return response.unauthorized({ error: 'Only admins can access this' })
    }

    const { limit = 20 } = request.qs()

    try {
      const data = await AdminDashboardService.getRecentConversions(parseInt(limit))
      return response.ok({ success: true, data })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch conversions'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get users by role
   */
  async users({ auth, request, response }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'admin') {
      return response.unauthorized({ error: 'Only admins can access this' })
    }

    const { role, page = 1, limit = 20 } = request.qs()

    try {
      const data = await AdminDashboardService.getUsersByRole(role, page, limit)
      return response.ok({ success: true, data })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch users'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get commission statistics
   */
  async commissionStats({ auth, response }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'admin') {
      return response.unauthorized({ error: 'Only admins can access this' })
    }

    try {
      const data = await AdminDashboardService.getCommissionStats()
      return response.ok({ success: true, data })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch commission stats'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get payout statistics
   */
  async payoutStats({ auth, response }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'admin') {
      return response.unauthorized({ error: 'Only admins can access this' })
    }

    try {
      const data = await AdminDashboardService.getPayoutStats()
      return response.ok({ success: true, data })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch payout stats'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get top campaigns
   */
  async topCampaigns({ auth, request, response }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'admin') {
      return response.unauthorized({ error: 'Only admins can access this' })
    }

    const { limit = 10 } = request.qs()

    try {
      const data = await AdminDashboardService.getTopCampaigns(parseInt(limit))
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

    if (user.role !== 'admin') {
      return response.unauthorized({ error: 'Only admins can access this' })
    }

    const { limit = 10 } = request.qs()

    try {
      const data = await AdminDashboardService.getTopAffiliates(parseInt(limit))
      return response.ok({ success: true, data })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch affiliates'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get financial overview
   */
  async financialOverview({ auth, response }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'admin') {
      return response.unauthorized({ error: 'Only admins can access this' })
    }

    try {
      const data = await AdminDashboardService.getFinancialOverview()
      return response.ok({ success: true, data })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch financials'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get system health
   */
  async systemHealth({ auth, response }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'admin') {
      return response.unauthorized({ error: 'Only admins can access this' })
    }

    try {
      const data = await AdminDashboardService.getSystemHealth()
      return response.ok({ success: true, data })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch system health'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get platform activity
   */
  async platformActivity({ auth, request, response }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'admin') {
      return response.unauthorized({ error: 'Only admins can access this' })
    }

    const { days = 30 } = request.qs()

    try {
      const data = await AdminDashboardService.getPlatformActivity(parseInt(days))
      return response.ok({ success: true, data })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch activity'
      return response.badRequest({ error: msg })
    }
  }
}
