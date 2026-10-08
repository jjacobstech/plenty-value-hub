import VendorConversion from '#models/vendor_conversion'
import CommissionLedger from '#models/commission_ledger'
import Campaign from '#models/campaign'
import AffiliateLink from '#models/affiliate_link'
import { DateTime } from 'luxon'

export interface MetricsData {
  period: string
  totalConversions: number
  totalRevenue: number
  totalCommissions: number
  averageOrderValue: number
  conversionRate: number
  topCampaigns: Array<{ id: number; name: string; conversions: number; revenue: number }>
  topAffiliates: Array<{ id: number; name: string; conversions: number; commission: number }>
}

export interface CampaignMetrics {
  campaignId: number
  campaignName: string
  totalConversions: number
  totalRevenue: number
  totalCommissions: number
  approvedConversions: number
  pendingConversions: number
  rejectedConversions: number
  averageOrderValue: number
  conversionRate: number
  fraudFlagRate: number
  topAffiliates: Array<{
    affiliateId: number
    conversions: number
    revenue: number
    commission: number
  }>
  dailyTrend: Array<{
    date: string
    conversions: number
    revenue: number
    commissions: number
  }>
}

export interface AffiliateMetrics {
  affiliateId: number
  affiliateName: string
  totalConversions: number
  totalRevenue: number
  totalCommission: number
  approvedCommission: number
  pendingCommission: number
  activeLinks: number
  campaigns: Array<{
    campaignId: number
    campaignName: string
    conversions: number
    revenue: number
    commission: number
  }>
  performanceRating: number
}

export interface CommissionMetrics {
  totalCommissioned: number
  totalApproved: number
  totalPending: number
  totalReversed: number
  totalPayouts: number
  byStatus: Record<string, number>
  byAffiliateTop10: Array<{
    affiliateId: number
    affiliateName: string
    amount: number
    status: string
  }>
  projectedNextPayment: number
}

export default class AnalyticsService {
  /**
   * Get real-time metrics dashboard
   */
  static async getMetrics(
    vendorId?: number,
    campaignId?: number,
    dateRange?: { start: DateTime; end: DateTime }
  ): Promise<MetricsData> {
    let query = VendorConversion.query()

    if (vendorId) {
      query = query.where('vendor_id', vendorId)
    }

    if (campaignId) {
      query = query.where('campaign_id', campaignId)
    }

    if (dateRange?.start && dateRange?.end) {
      const startSql = dateRange.start.toSQL()
      const endSql = dateRange.end.toSQL()
      if (startSql && endSql) {
        query = query.where('created_at', '>=', startSql).where('created_at', '<=', endSql)
      }
    }

    const conversions = await query.select('*')

    const totalConversions = conversions.length
    const totalRevenue = conversions.reduce((sum, c) => sum + (c.amount || 0), 0)
    const approvedConversions = conversions.filter((c) => c.status === 'approved').length

    // Get commissions
    let commissionQuery = CommissionLedger.query()
    if (vendorId) {
      commissionQuery = commissionQuery.where('vendor_id', vendorId)
    }
    const commissions = await commissionQuery.select('*')
    const totalCommissions = commissions
      .filter((c) => c.status === 'approved')
      .reduce((sum, c) => sum + (c.amount || 0), 0)

    // Campaign breakdown
    const campaignMap = new Map<number, { name: string; conversions: number; revenue: number }>()
    for (const conv of conversions) {
      if (!campaignMap.has(conv.campaignId)) {
        const campaign = await Campaign.find(conv.campaignId)
        campaignMap.set(conv.campaignId, {
          name: campaign?.name || 'Unknown',
          conversions: 0,
          revenue: 0,
        })
      }
      const data = campaignMap.get(conv.campaignId)!
      data.conversions++
      data.revenue += conv.amount
    }

    const topCampaigns = Array.from(campaignMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Affiliate breakdown
    const affiliateMap = new Map<number, { conversions: number; commission: number }>()
    for (const conv of conversions) {
      if (!conv.affiliateId) continue
      if (!affiliateMap.has(conv.affiliateId)) {
        affiliateMap.set(conv.affiliateId, { conversions: 0, commission: 0 })
      }
      const data = affiliateMap.get(conv.affiliateId)!
      data.conversions++

      const commission = commissions.find(
        (c) => c.conversionId === conv.id && c.status === 'approved'
      )
      if (commission) {
        data.commission += commission.amount || 0
      }
    }

    const topAffiliates = Array.from(affiliateMap.entries())
      .map(([id, data]) => ({ id, name: `Affiliate ${id}`, ...data }))
      .sort((a, b) => b.commission - a.commission)
      .slice(0, 5)

    return {
      period: `${dateRange?.start?.toISODate() || 'all'} to ${dateRange?.end?.toISODate() || 'today'}`,
      totalConversions,
      totalRevenue,
      totalCommissions,
      averageOrderValue: totalConversions > 0 ? totalRevenue / totalConversions : 0,
      conversionRate: totalConversions > 0 ? (approvedConversions / totalConversions) * 100 : 0,
      topCampaigns,
      topAffiliates,
    }
  }

  /**
   * Get detailed campaign performance metrics
   */
  static async getCampaignMetrics(campaignId: number, daysBack: number = 30): Promise<CampaignMetrics> {
    const campaign = await Campaign.findOrFail(campaignId)
    const startDate = DateTime.now().minus({ days: daysBack })

    const startSql = startDate.toSQL()
    const conversions = await VendorConversion.query()
      .where('campaign_id', campaignId)
      .where('created_at', '>=', startSql!)
      .select('*')

    const totalConversions = conversions.length
    const totalRevenue = conversions.reduce((sum, c) => sum + (c.amount || 0), 0)
    const approvedConversions = conversions.filter((c) => c.status === 'approved').length
    const pendingConversions = conversions.filter((c) => c.status === 'pending').length
    const rejectedConversions = conversions.filter((c) => c.status === 'rejected').length
    const fraudFlaggedCount = conversions.filter((c) => c.isFraudFlagged).length

    // Get commissions for this campaign
    const commissions = await CommissionLedger.query()
      .whereIn(
        'vendor_conversion_id',
        conversions.map((c) => c.id)
      )
      .select('*')
    const totalCommissions = commissions.reduce((sum, c) => sum + (c.amount || 0), 0)

    // Affiliate breakdown
    const affiliateMap = new Map<
      number,
      { conversions: number; revenue: number; commission: number }
    >()
    for (const conv of conversions) {
      if (!conv.affiliateId) continue
      if (!affiliateMap.has(conv.affiliateId)) {
        affiliateMap.set(conv.affiliateId, { conversions: 0, revenue: 0, commission: 0 })
      }
      const data = affiliateMap.get(conv.affiliateId)!
      data.conversions++
      data.revenue += conv.amount || 0

      const commission = commissions.find(
        (c) => c.conversionId === conv.id && c.status === 'approved'
      )
      if (commission) {
        data.commission += commission.amount || 0
      }
    }

    const topAffiliates = Array.from(affiliateMap.entries())
      .map(([affiliateId, data]) => ({ affiliateId, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Daily trend
    const dailyMap = new Map<string, { conversions: number; revenue: number; commissions: number }>()
    conversions.forEach((c) => {
      const date = c.createdAt.toISODate()
      if (date) {
        if (!dailyMap.has(date)) {
          dailyMap.set(date, { conversions: 0, revenue: 0, commissions: 0 })
        }
        const data = dailyMap.get(date)!
        data.conversions++
        data.revenue += c.amount
      }
    })

    commissions.forEach((c) => {
      const date = c.createdAt.toISODate()
      if (date && dailyMap.has(date)) {
        const data = dailyMap.get(date)!
        data.commissions += c.amount
      }
    })

    const dailyTrend = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      campaignId,
      campaignName: campaign.name,
      totalConversions,
      totalRevenue,
      totalCommissions,
      approvedConversions,
      pendingConversions,
      rejectedConversions,
      averageOrderValue: totalConversions > 0 ? totalRevenue / totalConversions : 0,
      conversionRate: totalConversions > 0 ? (approvedConversions / totalConversions) * 100 : 0,
      fraudFlagRate: totalConversions > 0 ? (fraudFlaggedCount / totalConversions) * 100 : 0,
      topAffiliates,
      dailyTrend,
    }
  }

  /**
   * Get detailed affiliate performance metrics
   */
  static async getAffiliateMetrics(affiliateId: number, daysBack: number = 30): Promise<AffiliateMetrics> {
    const startDate = DateTime.now().minus({ days: daysBack })
    const startSql = startDate.toSQL()

    const conversions = await VendorConversion.query()
      .where('affiliate_id', affiliateId)
      .where('created_at', '>=', startSql!)
      .select('*')

    const totalConversions = conversions.length
    const totalRevenue = conversions.reduce((sum, c) => sum + c.amount, 0)

    // Get commissions
    const commissions = await CommissionLedger.query()
      .where('affiliate_id', affiliateId)
      .where('created_at', '>=', startSql!)
      .select('*')

    const totalCommission = commissions.reduce((sum, c) => sum + c.amount, 0)
    const approvedCommission = commissions
      .filter((c) => c.status === 'approved')
      .reduce((sum, c) => sum + c.amount, 0)
    const pendingCommission = commissions
      .filter((c) => c.status === 'pending')
      .reduce((sum, c) => sum + c.amount, 0)

    // Active links count
    const activeLinks = await AffiliateLink.query()
      .where('affiliate_id', affiliateId)
      .where('status', 'active')
      .count('*', 'count')

    // Campaign breakdown
    const campaignMap = new Map<
      number,
      { campaignName: string; conversions: number; revenue: number; commission: number }
    >()
    for (const conv of conversions) {
      if (!campaignMap.has(conv.campaignId)) {
        const campaign = await Campaign.find(conv.campaignId)
        campaignMap.set(conv.campaignId, {
          campaignName: campaign?.name || 'Unknown',
          conversions: 0,
          revenue: 0,
          commission: 0,
        })
      }
      const data = campaignMap.get(conv.campaignId)!
      data.conversions++
      data.revenue += conv.amount

      const commission = commissions.find(
        (c) => c.conversionId === conv.id && c.status === 'approved'
      )
      if (commission) {
        data.commission += commission.amount || 0
      }
    }

    const campaigns = Array.from(campaignMap.entries()).map(([campaignId, data]) => ({
      campaignId,
      ...data,
    }))

    // Performance rating: 0-100 based on conversion rate, fraud flags, and revenue
    const allConversions = await VendorConversion.query()
      .where('affiliate_id', affiliateId)
      .select('*')
    const fraudRate = allConversions.length > 0
      ? (allConversions.filter((c) => c.isFraudFlagged).length / allConversions.length) * 100
      : 0
    const conversionRate = allConversions.length > 0
      ? (allConversions.filter((c) => c.status === 'approved').length / allConversions.length) * 100
      : 0

    const performanceRating = Math.max(
      0,
      Math.min(100, conversionRate * 0.6 - fraudRate * 0.4)
    )

    return {
      affiliateId,
      affiliateName: `Affiliate ${affiliateId}`,
      totalConversions,
      totalRevenue,
      totalCommission,
      approvedCommission,
      pendingCommission,
      activeLinks: (activeLinks[0] as any)?.count || 0,
      campaigns,
      performanceRating,
    }
  }

  /**
   * Get commission tracking metrics
   */
  static async getCommissionMetrics(vendorId?: number): Promise<CommissionMetrics> {
    let query = CommissionLedger.query()

    if (vendorId) {
      query = query.where('vendor_id', vendorId)
    }

    const commissions = await query.select('*')

    const byStatus: Record<string, number> = {
      pending: 0,
      approved: 0,
      paid: 0,
      reversed: 0,
    }

    commissions.forEach((c) => {
      if (byStatus.hasOwnProperty(c.status)) {
        byStatus[c.status]++
      }
    })

    const totalCommissioned = commissions.reduce((sum, c) => sum + c.amount, 0)
    const totalApproved = commissions
      .filter((c) => c.status === 'approved')
      .reduce((sum, c) => sum + c.amount, 0)
    const totalPending = commissions
      .filter((c) => c.status === 'pending')
      .reduce((sum, c) => sum + c.amount, 0)
    const totalReversed = commissions
      .filter((c) => c.status === 'disputed')
      .reduce((sum, c) => sum + c.amount, 0)
    const totalPayouts = commissions
      .filter((c) => c.status === 'paid')
      .reduce((sum, c) => sum + c.amount, 0)

    // Top affiliates by commission
    const affiliateMap = new Map<number, { amount: number; status: string }>()
    commissions.forEach((c) => {
      if (c.affiliateId) {
        if (!affiliateMap.has(c.affiliateId)) {
          affiliateMap.set(c.affiliateId, { amount: 0, status: 'pending' })
        }
        const data = affiliateMap.get(c.affiliateId)!
        data.amount += c.amount
      }
    })

    const byAffiliateTop10 = Array.from(affiliateMap.entries())
      .map(([affiliateId, data]) => ({
        affiliateId,
        affiliateName: `Affiliate ${affiliateId}`,
        amount: data.amount,
        status: data.status,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)

    // Projected next payment (sum of approved + 50% of pending)
    const projectedNextPayment = totalApproved + totalPending * 0.5

    return {
      totalCommissioned,
      totalApproved,
      totalPending,
      totalReversed,
      totalPayouts,
      byStatus,
      byAffiliateTop10,
      projectedNextPayment,
    }
  }

  /**
   * Export metrics to CSV
   */
  static generateCSV(
    data: any,
    type: 'conversions' | 'commissions' | 'campaigns' | 'affiliates'
  ): string {
    if (type === 'conversions' && Array.isArray(data)) {
      const headers = ['ID', 'Campaign', 'Affiliate', 'Amount', 'Status', 'Date']
      const rows = data.map((c: any) => [
        c.id,
        c.campaignId,
        c.affiliateId,
        c.amount,
        c.status,
        c.createdAt?.toISO() || '',
      ])
      return this.arrayToCSV([headers, ...rows])
    }

    if (type === 'commissions' && Array.isArray(data)) {
      const headers = ['ID', 'Affiliate', 'Amount', 'Status', 'Date']
      const rows = data.map((c: any) => [
        c.id,
        c.affiliateId,
        c.amount,
        c.status,
        c.createdAt?.toISO() || '',
      ])
      return this.arrayToCSV([headers, ...rows])
    }

    return ''
  }

  private static arrayToCSV(array: any[][]): string {
    return array
      .map((row) =>
        row
          .map((cell) => {
            const value = cell?.toString() || ''
            return value.includes(',') ? `"${value}"` : value
          })
          .join(',')
      )
      .join('\n')
  }
}
