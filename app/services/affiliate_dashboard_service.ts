import AffiliateLink from '#models/affiliate_link'
import Conversion from '#models/conversion'
import CommissionLedger from '#models/commission_ledger'
import PayoutRequest from '#models/payout_request'
import AffiliateWallet from '#models/affiliate_wallet'
import Campaign from '#models/campaign'
import { DateTime } from 'luxon'

export default class AffiliateDashboardService {
  /**
   * Get affiliate overview
   */
  static async getOverview(affiliateId: number) {
    const links = await AffiliateLink.query()
      .where('affiliate_id', affiliateId)

    const wallet = await AffiliateWallet.query()
      .where('affiliate_id', affiliateId)
      .first()

    let totalClicks = 0
    let totalConversions = 0
    let totalEarnings = 0

    for (const link of links) {
      totalClicks += link.totalClicks
      totalConversions += link.totalConversions
      totalEarnings += link.totalEarnings
    }

    const commissions = await CommissionLedger.query()
      .where('affiliate_id', affiliateId)

    const pendingAmount = commissions
      .filter((c) => c.status === 'pending')
      .reduce((sum, c) => sum + c.netCommission, 0)

    const approvedAmount = commissions
      .filter((c) => c.status === 'approved')
      .reduce((sum, c) => sum + c.netCommission, 0)

    const paidAmount = commissions
      .filter((c) => c.status === 'paid')
      .reduce((sum, c) => sum + c.netCommission, 0)

    const conversionRate = totalClicks > 0 
      ? parseFloat(((totalConversions / totalClicks) * 100).toFixed(2))
      : 0

    return {
      summary: {
        totalLinks: links.length,
        totalClicks,
        totalConversions,
        conversionRate,
        totalEarnings,
      },
      earnings: {
        pending: pendingAmount,
        approved: approvedAmount,
        paid: paidAmount,
        total: pendingAmount + approvedAmount + paidAmount,
      },
      wallet: {
        available: wallet?.availableBalance || 0,
        pending: wallet?.pendingBalance || 0,
      },
    }
  }

  /**
   * Get affiliate links with performance
   */
  static async getLinksPerformance(affiliateId: number, page = 1, limit = 20) {
    const paginator = await AffiliateLink.query()
      .where('affiliate_id', affiliateId)
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    const linksWithMetrics = paginator.map((link: any) => {
      const conversionRate = link.totalClicks > 0
        ? parseFloat(((link.totalConversions / link.totalClicks) * 100).toFixed(2))
        : 0

      return {
        id: link.id,
        slug: link.slug,
        customAlias: link.customAlias,
        campaignId: link.campaignId,
        clicks: link.totalClicks,
        conversions: link.totalConversions,
        conversionRate,
        earnings: link.totalEarnings,
        isActive: link.isActive,
        createdAt: link.createdAt,
      }
    })

    return {
      data: linksWithMetrics,
      total: linksWithMetrics.length,
      page,
      limit,
    }
  }

  /**
   * Get available campaigns for affiliate
   */
  static async getAvailableCampaigns(affiliateId: number, page = 1, limit = 20) {
    const existingCampaigns = await AffiliateLink.query()
      .where('affiliate_id', affiliateId)
      .select('campaign_id')

    const campaignIds = existingCampaigns.map((l) => l.campaignId)

    let query = Campaign.query().where('status', 'active')

    if (campaignIds.length > 0) {
      query = query.whereNotIn('id', campaignIds)
    }

    const paginator = await query
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    const campaignsWithDetails = paginator.map((c: any) => ({
      id: c.id,
      name: c.name,
      productServiceName: c.productServiceName,
      category: c.category,
      commissionType: c.commissionType,
      commissionAmount: c.commissionAmount,
      activeAffiliates: c.activeAffiliates,
      totalConversions: c.totalConversions,
      description: c.description.substring(0, 100),
    }))

    return {
      data: campaignsWithDetails,
      total: campaignsWithDetails.length,
      page,
      limit,
    }
  }

  /**
   * Get commission history
   */
  static async getCommissions(affiliateId: number, status?: string, page = 1, limit = 20) {
    let query = CommissionLedger.query().where('affiliate_id', affiliateId)

    if (status) {
      query = query.where('status', status)
    }

    const paginator = await query
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    const commissionsWithDetails = paginator.map((c: any) => ({
      id: c.id,
      ledgerId: c.ledgerId,
      orderValue: c.orderValue,
      commissionAmount: c.commissionAmount,
      netCommission: c.netCommission,
      status: c.status,
      createdAt: c.createdAt,
      approvedAt: c.approvedAt,
      paidAt: c.paidAt,
    }))

    return {
      data: commissionsWithDetails,
      total: commissionsWithDetails.length,
      page,
      limit,
    }
  }

  /**
   * Get payout history
   */
  static async getPayouts(affiliateId: number, status?: string, page = 1, limit = 20) {
    let query = PayoutRequest.query().where('affiliate_id', affiliateId)

    if (status) {
      query = query.where('status', status)
    }

    const paginator = await query
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    const payoutsWithDetails = paginator.map((p: any) => ({
      id: p.id,
      requestId: p.requestId,
      amount: p.amount,
      netAmount: p.netAmount,
      status: p.status,
      paymentMethod: p.paymentMethod,
      referenceNumber: p.referenceNumber,
      createdAt: p.createdAt,
      completedAt: p.completedAt,
    }))

    return {
      data: payoutsWithDetails,
      total: payoutsWithDetails.length,
      page,
      limit,
    }
  }

  /**
   * Get earnings breakdown by campaign
   */
  static async getEarningsBreakdown(affiliateId: number) {
    const links = await AffiliateLink.query()
      .where('affiliate_id', affiliateId)

    const breakdown = []

    for (const link of links) {
      const campaign = await Campaign.find(link.campaignId)

      if (campaign) {
        breakdown.push({
          campaignId: campaign.id,
          campaignName: campaign.name,
          links: 1,
          clicks: link.totalClicks,
          conversions: link.totalConversions,
          earnings: link.totalEarnings,
          percentage: 0 as number,
        })
      }
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
   * Get trending links
   */
  static async getTrendingLinks(affiliateId: number, limit = 5) {
    const links = await AffiliateLink.query()
      .where('affiliate_id', affiliateId)
      .orderBy('total_clicks', 'desc')
      .limit(limit)

    return links.map((link) => ({
      id: link.id,
      slug: link.slug,
      customAlias: link.customAlias,
      clicks: link.totalClicks,
      conversions: link.totalConversions,
      earnings: link.totalEarnings,
    }))
  }

  /**
   * Get trend data
   */
  static async getTrendData(affiliateId: number, days = 30) {
    const links = await AffiliateLink.query()
      .where('affiliate_id', affiliateId)
      .select('id')

    const linkIds = links.map((l) => l.id)

    if (linkIds.length === 0) {
      return []
    }

    const startDate = DateTime.now().minus({ days }).startOf('day')
    const endDate = DateTime.now().endOf('day')

    const conversions = await Conversion.query()
      .whereIn('affiliate_link_id', linkIds)
      .whereBetween('converted_at', [startDate.toSQL(), endDate.toSQL()])

    const trendMap = new Map<string, { clicks: number; conversions: number; earnings: number }>()

    // Initialize dates
    for (let i = 0; i < days; i++) {
      const date = startDate.plus({ days: i }).toFormat('yyyy-MM-dd')
      trendMap.set(date, { clicks: 0, conversions: 0, earnings: 0 })
    }

    // Aggregate data
    for (const conversion of conversions) {
      const date = conversion.convertedAt.toFormat('yyyy-MM-dd')
      const data = trendMap.get(date) || { clicks: 0, conversions: 0, earnings: 0 }
      data.conversions += 1
      data.earnings += conversion.commissionAmount || 0
      trendMap.set(date, data)
    }

    return Array.from(trendMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }))
  }
}
