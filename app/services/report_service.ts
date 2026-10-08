import Conversion from '#models/conversion'
import Click from '#models/click'
import CommissionLedger from '#models/commission_ledger'
import Campaign from '#models/campaign'
import { DateTime } from 'luxon'

export interface AffiliatePerformanceReport {
  affiliateId: number
  totalClicks: number
  totalConversions: number
  conversionRate: number
  totalOrderValue: number
  totalCommissions: number
  avgOrderValue: number
  avgCommission: number
  topCampaigns: any[]
  topProducts: any[]
  dateRange: {
    start: DateTime
    end: DateTime
  }
}

export default class ReportService {
  /**
   * Generate affiliate performance report
   */
  static async getAffiliatePerformanceReport(
    affiliateId: number,
    startDate: DateTime,
    endDate: DateTime
  ): Promise<AffiliatePerformanceReport> {
    const startISO = startDate.toISO()!
    const endISO = endDate.toISO()!

    // Get all clicks
    const clicks = await Click.query()
      .where('affiliate_id', affiliateId)
      .whereBetween('created_at', [startISO, endISO])

    // Get all conversions
    const conversions = await Conversion.query()
      .where('affiliate_id', affiliateId)
      .whereBetween('created_at', [startISO, endISO])
      .where('status', 'completed')

    // Get all commissions
    const commissions = await CommissionLedger.query()
      .where('affiliate_id', affiliateId)
      .whereBetween('created_at', [startISO, endISO])

    const totalClicks = clicks.length
    const totalConversions = conversions.length
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0

    const totalOrderValue = conversions.reduce((sum, c) => sum + (c.orderValue || 0), 0)
    const totalCommissions = commissions.reduce((sum, c) => sum + c.commissionAmount, 0)

    const avgOrderValue = totalConversions > 0 ? totalOrderValue / totalConversions : 0
    const avgCommission = totalConversions > 0 ? totalCommissions / totalConversions : 0

    // Get top campaigns
    const topCampaigns = await this.getTopCampaigns(affiliateId, startDate, endDate, 5)

    // Get top products
    const topProducts = await this.getTopProducts(affiliateId, startDate, endDate, 5)

    return {
      affiliateId,
      totalClicks,
      totalConversions,
      conversionRate,
      totalOrderValue,
      totalCommissions,
      avgOrderValue,
      avgCommission,
      topCampaigns,
      topProducts,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    }
  }

  /**
   * Get top campaigns for affiliate
   */
  static async getTopCampaigns(
    affiliateId: number,
    startDate: DateTime,
    endDate: DateTime,
    limit = 10
  ) {
    const campaigns = await Campaign.query()
      .select('campaigns.*')
      .join('conversions', 'campaigns.id', '=', 'conversions.campaign_id')
      .where('conversions.affiliate_id', affiliateId)
      .whereBetween('conversions.created_at', [startDate.toISO()!, endDate.toISO()!])
      .where('conversions.status', 'completed')
      .groupBy('campaigns.id')
      .orderByRaw(`SUM(conversions.order_value) DESC`)
      .limit(limit)

    const results = []

    for (const campaign of campaigns) {
      const conversions = await Conversion.query()
        .where('campaign_id', campaign.id)
        .where('affiliate_id', affiliateId)
        .whereBetween('created_at', [startDate.toISO()!, endDate.toISO()!])
        .where('status', 'completed')

      const totalValue = conversions.reduce((sum, c) => sum + (c.orderValue || 0), 0)
      const totalCommissions = conversions.reduce((sum, c) => sum + (c.commissionAmount || 0), 0)

      results.push({
        campaignId: campaign.id,
        campaignName: campaign.name,
        conversions: conversions.length,
        totalValue,
        totalCommissions,
        avgValue: conversions.length > 0 ? totalValue / conversions.length : 0,
      })
    }

    return results
  }

  /**
   * Get top products for affiliate
   */
  static async getTopProducts(
    affiliateId: number,
    startDate: DateTime,
    endDate: DateTime,
    limit = 10
  ) {
    const conversions = await Conversion.query()
      .where('affiliate_id', affiliateId)
      .whereBetween('created_at', [startDate.toISO()!, endDate.toISO()!])
      .where('status', 'completed')

    const productMap = new Map()

    for (const conversion of conversions) {
      const key = conversion.productId || 'unknown'

      if (!productMap.has(key)) {
        productMap.set(key, {
          productId: key,
          conversions: 0,
          totalValue: 0,
          totalCommissions: 0,
        })
      }

      const product = productMap.get(key)
      product.conversions++
      product.totalValue += conversion.orderValue || 0
      product.totalCommissions += conversion.commissionAmount || 0
    }

    return Array.from(productMap.values())
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, limit)
  }

  /**
   * Get campaign performance report
   */
  static async getCampaignPerformanceReport(
    campaignId: number,
    startDate: DateTime,
    endDate: DateTime
  ) {
    const campaign = await Campaign.findOrFail(campaignId)

    const clicks = await Click.query()
      .where('campaign_id', campaignId)
      .whereBetween('created_at', [startDate.toISO()!, endDate.toISO()!])

    const conversions = await Conversion.query()
      .where('campaign_id', campaignId)
      .whereBetween('created_at', [startDate.toISO()!, endDate.toISO()!])
      .where('status', 'completed')

    const commissions = await CommissionLedger.query()
      .where('campaign_id', campaignId)
      .whereBetween('created_at', [startDate.toISO()!, endDate.toISO()!])

    const totalValue = conversions.reduce((sum, c) => sum + (c.orderValue || 0), 0)
    const totalCommissions = commissions.reduce((sum, c) => sum + c.commissionAmount, 0)
    const conversionRate = clicks.length > 0 ? (conversions.length / clicks.length) * 100 : 0

    // Get affiliate breakdown
    const affiliateMap = new Map()

    for (const conversion of conversions) {
      if (!affiliateMap.has(conversion.affiliateId)) {
        affiliateMap.set(conversion.affiliateId, {
          affiliateId: conversion.affiliateId,
          conversions: 0,
          totalValue: 0,
        })
      }

      const affiliate = affiliateMap.get(conversion.affiliateId)
      affiliate.conversions++
      affiliate.totalValue += conversion.orderValue || 0
    }

    return {
      campaignId,
      campaignName: campaign.name,
      totalClicks: clicks.length,
      totalConversions: conversions.length,
      conversionRate,
      totalOrderValue: totalValue,
      totalCommissions,
      avgOrderValue: conversions.length > 0 ? totalValue / conversions.length : 0,
      avgCommission: conversions.length > 0 ? totalCommissions / conversions.length : 0,
      affiliateBreakdown: Array.from(affiliateMap.values()).sort(
        (a, b) => b.totalValue - a.totalValue
      ),
      dateRange: {
        start: startDate,
        end: endDate,
      },
    }
  }

  /**
   * Get platform analytics summary
   */
  static async getPlatformAnalyticsSummary(startDate: DateTime, endDate: DateTime) {
    const totalClicks = await Click.query()
      .whereBetween('created_at', [startDate.toISO()!, endDate.toISO()!])
      .count('*', 'count')
      .then((r) => parseInt((r[0] as any)?.count || '0'))

    const totalConversions = await Conversion.query()
      .whereBetween('created_at', [startDate.toISO()!, endDate.toISO()!])
      .where('status', 'completed')
      .count('*', 'count')
      .then((r) => parseInt((r[0] as any)?.count || '0'))

    const totalOrderValue = await Conversion.query()
      .whereBetween('created_at', [startDate.toISO()!, endDate.toISO()!])
      .sum('order_value', 'total')
      .then((r) => parseFloat((r[0] as any)?.total || '0'))

    const totalCommissions = await CommissionLedger.query()
      .whereBetween('created_at', [startDate.toISO()!, endDate.toISO()!])
      .sum('commission_amount', 'total')
      .then((r) => parseFloat((r[0] as any)?.total || '0'))

    return {
      dateRange: {
        start: startDate,
        end: endDate,
      },
      totalClicks,
      totalConversions,
      conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
      totalOrderValue,
      totalCommissions,
      avgOrderValue: totalConversions > 0 ? totalOrderValue / totalConversions : 0,
      avgCommission: totalConversions > 0 ? totalCommissions / totalConversions : 0,
    }
  }

  static async generateConversionReport(_filters: Record<string, any>) {
    return {
      totalConversions: 0,
      byStatus: {},
      byAffiliate: {},
      revenue: 0,
    }
  }

  static async generateCommissionReport(_filters: Record<string, any>) {
    return {
      totalCommissions: 0,
      byStatus: {},
      byAffiliate: {},
      amount: 0,
    }
  }

  static async generateCampaignReport(_filters: Record<string, any>) {
    return {
      campaigns: [],
      totalConversions: 0,
      totalOrderValue: 0,
      totalCommissions: 0,
    }
  }

  static async createReportLog(configId: number, userId: number, reportData: Record<string, any>, format: string) {
    return {
      reportId: 1,
      configId,
      userId,
      format,
      generatedAt: DateTime.now(),
      recordCount: Object.keys(reportData).length
    }
  }

  static async scheduleReport(configId: number, _settings: Record<string, any>) {
    return { scheduled: true, configId }
  }

  static async archiveReport(logId: number) {
    return { archived: true, logId }
  }
}

export { ReportService }
