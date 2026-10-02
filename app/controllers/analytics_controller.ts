import AnalyticsService from '#services/analytics_service'
import VendorConversion from '#models/vendor_conversion'
import CommissionLedger from '#models/commission_ledger'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class AnalyticsController {
  /**
   * Get real-time metrics dashboard
   * GET /api/analytics/metrics
   */
  async getMetrics({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (!['admin', 'vendor', 'affiliate'].includes(user.role)) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const campaignId = request.input('campaign_id')
    const startDate = request.input('start_date')
    const endDate = request.input('end_date')

    let vendorId: number | undefined
    if (user.role === 'vendor') {
      vendorId = user.id
    }

    let dateRange: { start: DateTime; end: DateTime } | undefined
    if (startDate && endDate) {
      dateRange = {
        start: DateTime.fromISO(startDate),
        end: DateTime.fromISO(endDate),
      }
    }

    const metrics = await AnalyticsService.getMetrics(vendorId, campaignId, dateRange)

    return response.json({
      success: true,
      data: metrics,
    })
  }

  /**
   * Get campaign performance metrics
   * GET /api/analytics/campaigns/:id
   */
  async getCampaignMetrics({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (!['admin', 'vendor'].includes(user.role)) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const daysBack = request.input('days', 30)

    try {
      const metrics = await AnalyticsService.getCampaignMetrics(params.id, daysBack)
      return response.json({
        success: true,
        data: metrics,
      })
    } catch (error) {
      return response.status(404).json({
        error: 'Campaign not found',
      })
    }
  }

  /**
   * List all campaigns with performance summary
   * GET /api/analytics/campaigns
   */
  async listCampaigns({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (!['admin', 'vendor'].includes(user.role)) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const sortBy = request.input('sort_by', 'revenue') // revenue, conversions, commission

    let query = VendorConversion.query()
      .select('campaign_id')
      .sum('amount', 'totalRevenue')
      .count('*', 'totalConversions')
      .groupBy('campaign_id')

    if (user.role === 'vendor') {
      query = query.where('vendor_id', user.id)
    }

    const campaigns = await query

    // Sort and paginate
    const sorted = campaigns.sort((a: any, b: any) => {
      if (sortBy === 'revenue') {
        return b.totalRevenue - a.totalRevenue
      } else if (sortBy === 'conversions') {
        return b.totalConversions - a.totalConversions
      }
      return 0
    })

    const start = (page - 1) * limit
    const paginated = sorted.slice(start, start + limit)

    return response.json({
      success: true,
      data: paginated,
      pagination: {
        total: sorted.length,
        perPage: limit,
        currentPage: page,
        lastPage: Math.ceil(sorted.length / limit),
      },
    })
  }

  /**
   * Get affiliate performance metrics
   * GET /api/analytics/affiliates/:id
   */
  async getAffiliateMetrics({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (!['admin', 'vendor', 'affiliate'].includes(user.role)) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    // Affiliates can only view their own metrics
    if (user.role === 'affiliate' && user.id !== params.id) {
      return response.status(403).json({ error: 'Can only view your own metrics' })
    }

    const daysBack = request.input('days', 30)

    try {
      const metrics = await AnalyticsService.getAffiliateMetrics(params.id, daysBack)
      return response.json({
        success: true,
        data: metrics,
      })
    } catch (error) {
      return response.status(404).json({
        error: 'Affiliate not found',
      })
    }
  }

  /**
   * List all affiliates with performance summary
   * GET /api/analytics/affiliates
   */
  async listAffiliates({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (!['admin', 'vendor'].includes(user.role)) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const sortBy = request.input('sort_by', 'revenue') // revenue, conversions, commission

    let query = VendorConversion.query()
      .select('affiliate_id')
      .sum('amount', 'totalRevenue')
      .count('*', 'totalConversions')
      .groupBy('affiliate_id')

    if (user.role === 'vendor') {
      query = query.where('vendor_id', user.id)
    }

    const affiliates = await query

    // Sort and paginate
    const sorted = affiliates.sort((a: any, b: any) => {
      if (sortBy === 'revenue') {
        return b.totalRevenue - a.totalRevenue
      } else if (sortBy === 'conversions') {
        return b.totalConversions - a.totalConversions
      }
      return 0
    })

    const start = (page - 1) * limit
    const paginated = sorted.slice(start, start + limit)

    return response.json({
      success: true,
      data: paginated,
      pagination: {
        total: sorted.length,
        perPage: limit,
        currentPage: page,
        lastPage: Math.ceil(sorted.length / limit),
      },
    })
  }

  /**
   * Get commission tracking metrics
   * GET /api/analytics/commissions
   */
  async getCommissions({ auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (!['admin', 'vendor'].includes(user.role)) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    let vendorId: number | undefined
    if (user.role === 'vendor') {
      vendorId = user.id
    }

    const metrics = await AnalyticsService.getCommissionMetrics(vendorId)

    return response.json({
      success: true,
      data: metrics,
    })
  }

  /**
   * Get commission payment schedule
   * GET /api/analytics/commission-schedule
   */
  async getCommissionSchedule({ auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (!['admin', 'vendor'].includes(user.role)) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    let query = CommissionLedger.query().where('status', 'approved')

    if (user.role === 'vendor') {
      query = query.where('vendor_id', user.id)
    }

    const commissions = await query.orderBy('created_at', 'asc')

    // Group by payment cycle
    const schedule = commissions.map((c) => ({
      affiliateId: c.affiliateId,
      amount: c.amount,
      approvedAt: c.createdAt,
      estimatedPaymentDate: c.createdAt.plus({ days: 14 }),
    }))

    return response.json({
      success: true,
      data: schedule,
    })
  }

  /**
   * Export conversions to CSV
   * GET /api/analytics/export/conversions
   */
  async exportConversions({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (!['admin', 'vendor'].includes(user.role)) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const campaignId = request.input('campaign_id')
    const startDate = request.input('start_date')
    const endDate = request.input('end_date')

    let query = VendorConversion.query()

    if (user.role === 'vendor') {
      query = query.where('vendor_id', user.id)
    }

    if (campaignId) {
      query = query.where('campaign_id', campaignId)
    }

    if (startDate && endDate) {
      const startSql = DateTime.fromISO(startDate).toSQL()
      const endSql = DateTime.fromISO(endDate).toSQL()
      if (startSql && endSql) {
        query = query.where('created_at', '>=', startSql).where('created_at', '<=', endSql)
      }
    }

    const conversions = await query.select('*')
    const csv = AnalyticsService.generateCSV(conversions, 'conversions')

    return response
      .type('text/csv')
      .header('Content-Disposition', 'attachment; filename="conversions.csv"')
      .send(csv)
  }

  /**
   * Export commissions to CSV
   * GET /api/analytics/export/commissions
   */
  async exportCommissions({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (!['admin', 'vendor'].includes(user.role)) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const startDate = request.input('start_date')
    const endDate = request.input('end_date')

    let query = CommissionLedger.query()

    if (user.role === 'vendor') {
      query = query.where('vendor_id', user.id)
    }

    if (startDate && endDate) {
      const startSql = DateTime.fromISO(startDate).toSQL()
      const endSql = DateTime.fromISO(endDate).toSQL()
      if (startSql && endSql) {
        query = query.where('created_at', '>=', startSql).where('created_at', '<=', endSql)
      }
    }

    const commissions = await query.select('*')
    const csv = AnalyticsService.generateCSV(commissions, 'commissions')

    return response
      .type('text/csv')
      .header('Content-Disposition', 'attachment; filename="commissions.csv"')
      .send(csv)
  }

  /**
   * Get analytics summary dashboard
   * GET /api/analytics/summary
   */
  async getSummary({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (!['admin', 'vendor'].includes(user.role)) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const daysBack = request.input('days', 30)
    const startDate = DateTime.now().minus({ days: daysBack })
    const startSql = startDate.toSQL()
    if (!startSql) return response.status(400).json({ error: 'Invalid date' })

    let conversionQuery = VendorConversion.query().where('created_at', '>=', startSql)

    if (user.role === 'vendor') {
      conversionQuery = conversionQuery.where('vendor_id', user.id)
    }

    const conversions = await conversionQuery.select('*')

    let commissionQuery = CommissionLedger.query().where('created_at', '>=', startDate.toSQL()!)

    if (user.role === 'vendor') {
      commissionQuery = commissionQuery.where('vendor_id', user.id)
    }

    const commissions = await commissionQuery.select('*')

    const summary = {
      period: `Last ${daysBack} days`,
      conversions: {
        total: conversions.length,
        approved: conversions.filter((c) => c.status === 'approved').length,
        pending: conversions.filter((c) => c.status === 'pending').length,
        rejected: conversions.filter((c) => c.status === 'rejected').length,
        flagged: conversions.filter((c) => c.isFraudFlagged).length,
      },
      revenue: {
        total: conversions.reduce((sum, c) => sum + c.amount, 0),
        average: conversions.length > 0 ? conversions.reduce((sum, c) => sum + c.amount, 0) / conversions.length : 0,
      },
      commissions: {
        total: commissions.reduce((sum, c) => sum + c.amount, 0),
        approved: commissions
          .filter((c) => c.status === 'approved')
          .reduce((sum, c) => sum + c.amount, 0),
        pending: commissions
          .filter((c) => c.status === 'pending')
          .reduce((sum, c) => sum + c.amount, 0),
      },
    }

    return response.json({
      success: true,
      data: summary,
    })
  }
}
