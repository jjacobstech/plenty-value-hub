import User from '#models/user'
import Campaign from '#models/campaign'
import Click from '#models/click'
import Conversion from '#models/conversion'
import CommissionLedger from '#models/commission_ledger'
import PayoutRequest from '#models/payout_request'
import { DateTime } from 'luxon'

export default class AdminDashboardService {
  /**
   * Get admin overview statistics
   */
  static async getOverview() {
    const [vendors, affiliates, admins, activeCampaigns, pendingPayouts] = await Promise.all([
      User.query().where('role', 'vendor').count('* as total').first(),
      User.query().where('role', 'affiliate').count('* as total').first(),
      User.query().where('role', 'admin').count('* as total').first(),
      Campaign.query().where('status', 'active').count('* as total').first(),
      PayoutRequest.query().where('status', 'pending').count('* as total').first(),
    ])

    const campaigns = await Campaign.query()
    const conversions = await Conversion.query()
    const commissions = await CommissionLedger.query()

    let totalRevenue = 0
    let totalCommissions = 0

    for (const campaign of campaigns) {
      totalRevenue += campaign.totalRevenue
      totalCommissions += campaign.totalCommission
    }

    const approvedCommissions = commissions
      .filter((c) => c.status === 'approved')
      .reduce((sum, c) => sum + c.netCommission, 0)

    const paidAmount = commissions
      .filter((c) => c.status === 'paid')
      .reduce((sum, c) => sum + c.netCommission, 0)

    return {
      users: {
        vendors: Number(vendors?.$extras?.total) || 0,
        affiliates: Number(affiliates?.$extras?.total) || 0,
        admins: Number(admins?.$extras?.total) || 0,
      },
      campaigns: {
        active: Number(activeCampaigns?.$extras?.total) || 0,
        total: campaigns.length,
      },
      transactions: {
        totalClicks: campaigns.reduce((sum, c) => sum + c.totalClicks, 0),
        totalConversions: conversions.length,
        totalRevenue,
      },
      finances: {
        totalCommissions,
        approvedCommissions,
        paidAmount,
        pending: totalCommissions - approvedCommissions - paidAmount,
      },
      payouts: {
        pending: Number(pendingPayouts?.$extras?.total) || 0,
      },
    }
  }

  /**
   * Get pending campaigns for approval
   */
  static async getPendingCampaigns(page = 1, limit = 20) {
    const campaigns = await Campaign.query()
      .where('status', 'pending_approval')
      .orderBy('created_at', 'asc')
      .paginate(page, limit)

    return campaigns
  }

  /**
   * Get recent conversions
   */
  static async getRecentConversions(limit = 20) {
    const conversions = await Conversion.query()
      .orderBy('created_at', 'desc')
      .limit(limit)

    return conversions.map((c) => ({
      id: c.id,
      conversionId: c.conversionId,
      affiliateId: c.affiliateId,
      campaignId: c.campaignId,
      status: c.status,
      orderValue: c.orderValue,
      commissionAmount: c.commissionAmount,
      createdAt: c.createdAt,
    }))
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(role: string, page = 1, limit = 20) {
    const users = await User.query()
      .where('role', role)
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    return users
  }

  /**
   * Get commission statistics
   */
  static async getCommissionStats() {
    const commissions = await CommissionLedger.query()

    const stats = {
      total: commissions.length,
      pending: commissions.filter((c) => c.status === 'pending').length,
      approved: commissions.filter((c) => c.status === 'approved').length,
      paid: commissions.filter((c) => c.status === 'paid').length,
      rejected: commissions.filter((c) => c.status === 'rejected').length,
      disputed: commissions.filter((c) => c.status === 'disputed').length,
      totalAmount: commissions.reduce((sum, c) => sum + c.netCommission, 0),
      pendingAmount: commissions
        .filter((c) => c.status === 'pending')
        .reduce((sum, c) => sum + c.netCommission, 0),
      approvedAmount: commissions
        .filter((c) => c.status === 'approved')
        .reduce((sum, c) => sum + c.netCommission, 0),
    }

    return stats
  }

  /**
   * Get payout statistics
   */
  static async getPayoutStats() {
    const payouts = await PayoutRequest.query()

    const stats = {
      total: payouts.length,
      pending: payouts.filter((p) => p.status === 'pending').length,
      approved: payouts.filter((p) => p.status === 'approved').length,
      processing: payouts.filter((p) => p.status === 'processing').length,
      completed: payouts.filter((p) => p.status === 'completed').length,
      failed: payouts.filter((p) => p.status === 'failed').length,
      totalAmount: payouts.reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: payouts
        .filter((p) => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0),
      completedAmount: payouts
        .filter((p) => p.status === 'completed')
        .reduce((sum, p) => sum + p.netAmount, 0),
    }

    return stats
  }

  /**
   * Get top campaigns
   */
  static async getTopCampaigns(limit = 10) {
    const campaigns = await Campaign.query()
      .orderBy('total_conversions', 'desc')
      .limit(limit)

    return campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      clicks: c.totalClicks,
      conversions: c.totalConversions,
      revenue: c.totalRevenue,
      activeAffiliates: c.activeAffiliates,
    }))
  }

  /**
   * Get top affiliates
   */
  static async getTopAffiliates(limit = 10) {
    const commissions = await CommissionLedger.query()
      .select('affiliate_id')
      .count('* as count')
      .sum('net_commission as earnings')
      .groupBy('affiliate_id')
      .orderByRaw('earnings DESC')
      .limit(limit)

    return commissions
  }

  /**
   * Get financial overview
   */
  static async getFinancialOverview() {
    const campaigns = await Campaign.query()
    const payouts = await PayoutRequest.query().where('status', 'completed')

    let totalRevenue = 0
    let totalCommissions = 0

    for (const campaign of campaigns) {
      totalRevenue += campaign.totalRevenue
      totalCommissions += campaign.totalCommission
    }

    const totalPaid = payouts.reduce((sum, p) => sum + p.netAmount, 0)
    const platformRevenue = totalCommissions - totalPaid
    const platformFees = totalCommissions * 0.02 // Estimated 2% platform fee

    return {
      totalRevenue,
      totalCommissions,
      totalPaid,
      remaining: totalCommissions - totalPaid,
      platformFees,
      platformRevenue,
    }
  }

  /**
   * Get system health metrics
   */
  static async getSystemHealth() {
    const campaigns = await Campaign.query()
    const conversions = await Conversion.query()
    const clicks = await Click.query()
    const users = await User.query()

    const conversionRate = clicks.length > 0
      ? parseFloat(((conversions.length / clicks.length) * 100).toFixed(2))
      : 0

    const avgClicksPerCampaign = campaigns.length > 0
      ? parseFloat((clicks.length / campaigns.length).toFixed(2))
      : 0

    const avgConversionsPerCampaign = campaigns.length > 0
      ? parseFloat((conversions.length / campaigns.length).toFixed(2))
      : 0

    return {
      activeCampaigns: campaigns.filter((c) => c.status === 'active').length,
      totalUsers: users.length,
      totalClicks: clicks.length,
      totalConversions: conversions.length,
      conversionRate,
      avgClicksPerCampaign,
      avgConversionsPerCampaign,
    }
  }

  /**
   * Get platform activity over time
   */
  static async getPlatformActivity(days = 30) {
    const startDate = DateTime.now().minus({ days }).startOf('day')

    const conversions = await Conversion.query()
      .where('converted_at', '>=', startDate.toSQL())

    const activityMap = new Map<string, { clicks: number; conversions: number; revenue: number }>()

    // Initialize dates
    for (let i = 0; i < days; i++) {
      const date = startDate.plus({ days: i }).toFormat('yyyy-MM-dd')
      activityMap.set(date, { clicks: 0, conversions: 0, revenue: 0 })
    }

    // Aggregate data
    for (const conversion of conversions) {
      const date = conversion.convertedAt.toFormat('yyyy-MM-dd')
      const data = activityMap.get(date) || { clicks: 0, conversions: 0, revenue: 0 }
      data.conversions += 1
      data.revenue += conversion.orderValue || 0
      activityMap.set(date, data)
    }

    return Array.from(activityMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }))
  }
}
