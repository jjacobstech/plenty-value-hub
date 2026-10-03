import Campaign from '#models/campaign'
import Click from '#models/click'
import Conversion from '#models/conversion'
import CommissionLedger from '#models/commission_ledger'
import { DateTime } from 'luxon'

export default class VendorDashboardService {
  /**
   * Get vendor overview dashboard
   */
  static async getOverview(vendorId: number) {
    const campaigns = await Campaign.query()
      .where('vendor_id', vendorId)

    const activeCampaigns = campaigns.filter((c) => c.status === 'active').length
    const draftCampaigns = campaigns.filter((c) => c.status === 'draft').length
    const pausedCampaigns = campaigns.filter((c) => c.status === 'paused').length

    let totalClicks = 0
    let totalConversions = 0
    let totalRevenue = 0
    let totalCommissions = 0

    for (const campaign of campaigns) {
      totalClicks += campaign.totalClicks
      totalConversions += campaign.totalConversions
      totalRevenue += campaign.totalRevenue
      totalCommissions += campaign.totalCommission
    }

    const conversionRate = totalClicks > 0 
      ? parseFloat(((totalConversions / totalClicks) * 100).toFixed(2))
      : 0

    return {
      campaigns: {
        active: activeCampaigns,
        draft: draftCampaigns,
        paused: pausedCampaigns,
        total: campaigns.length,
      },
      metrics: {
        totalClicks,
        totalConversions,
        conversionRate,
        totalRevenue,
        totalCommissions,
        avgOrderValue: totalConversions > 0 ? totalRevenue / totalConversions : 0,
      },
    }
  }

  /**
   * Get vendor's campaigns with performance
   */
  static async getCampaignsPerformance(vendorId: number, page = 1, limit = 20) {
    const paginator = await Campaign.query()
      .where('vendor_id', vendorId)
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    const campaignsWithMetrics = paginator.map((campaign: any) => {
      const conversionRate = campaign.totalClicks > 0
        ? parseFloat(((campaign.totalConversions / campaign.totalClicks) * 100).toFixed(2))
        : 0

      return {
        id: campaign.id,
        name: campaign.name,
        productServiceName: campaign.productServiceName,
        status: campaign.status,
        clicks: campaign.totalClicks,
        conversions: campaign.totalConversions,
        conversionRate,
        revenue: campaign.totalRevenue,
        commissions: campaign.totalCommission,
        activeAffiliates: campaign.activeAffiliates,
        createdAt: campaign.createdAt,
      }
    })

    return {
      data: campaignsWithMetrics,
      total: campaignsWithMetrics.length,
      page,
      limit,
    }
  }

  /**
   * Get top affiliates for vendor
   */
  static async getTopAffiliates(vendorId: number, limit = 10) {
    const campaigns = await Campaign.query()
      .where('vendor_id', vendorId)
      .select('id')

    const campaignIds = campaigns.map((c) => c.id)

    if (campaignIds.length === 0) {
      return []
    }

    const affiliates = await CommissionLedger.query()
      .whereIn('campaign_id', campaignIds)
      .where('status', 'approved')
      .select('affiliate_id')
      .count('* as conversions')
      .sum('net_commission as earnings')
      .groupBy('affiliate_id')
      .orderByRaw('earnings DESC')
      .limit(limit)

    return affiliates
  }

  /**
   * Get vendor financial summary
   */
  static async getFinancialSummary(vendorId: number) {
    const campaigns = await Campaign.query()
      .where('vendor_id', vendorId)
      .select('id')

    const campaignIds = campaigns.map((c) => c.id)

    let pendingCommissions = 0
    let approvedCommissions = 0
    let paidCommissions = 0
    let totalEarnings = 0

    if (campaignIds.length > 0) {
      const commissions = await CommissionLedger.query()
        .whereIn('campaign_id', campaignIds)

      for (const commission of commissions) {
        totalEarnings += commission.netCommission

        if (commission.status === 'pending') {
          pendingCommissions += commission.netCommission
        } else if (commission.status === 'approved') {
          approvedCommissions += commission.netCommission
        } else if (commission.status === 'paid') {
          paidCommissions += commission.netCommission
        }
      }
    }

    return {
      totalEarnings,
      pending: pendingCommissions,
      approved: approvedCommissions,
      paid: paidCommissions,
      platformFees: totalEarnings * 0.02,
      netEarnings: totalEarnings * 0.98,
    }
  }

  /**
   * Get recent activity
   */
  static async getRecentActivity(vendorId: number, limit = 20) {
    const campaigns = await Campaign.query()
      .where('vendor_id', vendorId)
      .select('id', 'name', 'created_at')
      .orderBy('created_at', 'desc')
      .limit(limit)

    const activities = campaigns.map((campaign) => ({
      type: 'campaign_created',
      title: `Campaign "${campaign.name}" created`,
      timestamp: campaign.createdAt,
    }))

    return activities.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis())
  }

  /**
   * Get campaign details with affiliates
   */
  static async getCampaignDetails(vendorId: number, campaignId: number) {
    const campaign = await Campaign.find(campaignId)

    if (!campaign || campaign.vendorId !== vendorId) {
      throw new Error('Campaign not found')
    }

    const clicks = await Click.query()
      .where('campaign_id', campaignId)

    const conversions = await Conversion.query()
      .where('campaign_id', campaignId)

    const commissions = await CommissionLedger.query()
      .where('campaign_id', campaignId)

    const conversionRate = clicks.length > 0 
      ? parseFloat(((conversions.length / clicks.length) * 100).toFixed(2))
      : 0

    return {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        commissionType: campaign.commissionType,
        commissionAmount: campaign.commissionAmount,
      },
      statistics: {
        totalAffiliates: campaign.activeAffiliates,
        totalClicks: clicks.length,
        totalConversions: conversions.length,
        conversionRate,
        totalRevenue: campaign.totalRevenue,
        totalCommissions: commissions.reduce((sum, c) => sum + c.netCommission, 0),
      },
    }
  }

  /**
   * Get earnings breakdown by campaign
   */
  static async getEarningsBreakdown(vendorId: number) {
    const campaigns = await Campaign.query()
      .where('vendor_id', vendorId)

    const breakdown = []

    for (const campaign of campaigns) {
      const commissions = await CommissionLedger.query()
        .where('campaign_id', campaign.id)

      const totalCommissions = commissions.reduce((sum, c) => sum + c.netCommission, 0)

      breakdown.push({
        campaignId: campaign.id,
        campaignName: campaign.name,
        earnings: totalCommissions,
        percentage: 0 as number,
      })
    }

    const totalEarnings = breakdown.reduce((sum, b) => sum + b.earnings, 0)

    breakdown.forEach((b) => {
      b.percentage = totalEarnings > 0 
        ? parseFloat(((b.earnings / totalEarnings) * 100).toFixed(2))
        : 0
    })

    return breakdown.sort((a, b) => b.earnings - a.earnings)
  }

  /**
   * Get trend data for chart
   */
  static async getTrendData(vendorId: number, days = 30) {
    const campaigns = await Campaign.query()
      .where('vendor_id', vendorId)
      .select('id')

    const campaignIds = campaigns.map((c) => c.id)

    if (campaignIds.length === 0) {
      return []
    }

    const startDate = DateTime.now().minus({ days }).startOf('day')
    const endDate = DateTime.now().endOf('day')

    const conversions = await Conversion.query()
      .whereIn('campaign_id', campaignIds)
      .whereBetween('converted_at', [startDate.toSQL(), endDate.toSQL()])

    const trendMap = new Map<string, { clicks: number; conversions: number; revenue: number }>()

    // Initialize dates
    for (let i = 0; i < days; i++) {
      const date = startDate.plus({ days: i }).toFormat('yyyy-MM-dd')
      trendMap.set(date, { clicks: 0, conversions: 0, revenue: 0 })
    }

    // Aggregate data
    for (const conversion of conversions) {
      const date = conversion.convertedAt.toFormat('yyyy-MM-dd')
      const data = trendMap.get(date) || { clicks: 0, conversions: 0, revenue: 0 }
      data.conversions += 1
      data.revenue += conversion.orderValue || 0
      trendMap.set(date, data)
    }

    return Array.from(trendMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }))
  }
}
