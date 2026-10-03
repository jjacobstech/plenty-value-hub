import { randomUUID } from 'crypto'
import CommissionLedger from '#models/commission_ledger'
import Conversion from '#models/conversion'
import Campaign from '#models/campaign'
import { DateTime } from 'luxon'

export default class CommissionService {
  /**
   * Generate unique ledger ID
   */
  static generateLedgerId(): string {
    return `ledger_${randomUUID().replace(/-/g, '').substring(0, 20)}`
  }

  /**
   * Calculate commission amount based on conversion and campaign settings
   */
  static calculateCommission(
    orderValue: number,
    commissionType: 'percentage' | 'fixed_amount' | 'lead' | 'hybrid',
    commissionRate: number,
    leadValue?: number
  ): number {
    switch (commissionType) {
      case 'percentage':
        return (orderValue * commissionRate) / 100
      case 'fixed_amount':
        return commissionRate
      case 'lead':
        return leadValue || commissionRate
      case 'hybrid':
        const percentage = (orderValue * commissionRate) / 100
        return Math.max(percentage, commissionRate)
      default:
        return 0
    }
  }

  /**
   * Create commission ledger entry from conversion
   */
  static async createCommissionFromConversion(
    conversion: Conversion,
    campaign: Campaign,
    platformFeePercent: number = 5
  ): Promise<CommissionLedger> {
    const orderValue = conversion.orderValue || 0
    const commissionAmount = this.calculateCommission(
      orderValue,
      campaign.commissionType as any,
      campaign.commissionAmount,
      orderValue
    )

    const platformFee = (commissionAmount * platformFeePercent) / 100
    const netCommission = commissionAmount - platformFee

    const ledger = await CommissionLedger.create({
      ledgerId: this.generateLedgerId(),
      affiliateId: conversion.affiliateId,
      campaignId: conversion.campaignId,
      conversionId: conversion.id,
      affiliateLinkId: conversion.affiliateLinkId,
      orderValue: conversion.orderValue || 0,
      commissionType: campaign.commissionType as any,
      commissionRate: campaign.commissionAmount,
      commissionAmount,
      platformFeeAmount: platformFee,
      netCommission,
      currency: 'USD',
      status: 'pending',
      description: `Commission for conversion ${conversion.conversionId}`,
    })

    return ledger
  }

  /**
   * Get affiliate commissions with filtering
   */
  static async getAffiliateCommissions(
    affiliateId: number,
    status?: string,
    campaignId?: number,
    page = 1,
    limit = 20
  ) {
    let query = CommissionLedger.query().where('affiliate_id', affiliateId)

    if (status) {
      query = query.where('status', status)
    }

    if (campaignId) {
      query = query.where('campaign_id', campaignId)
    }

    return query.orderBy('created_at', 'desc').paginate(page, limit)
  }

  /**
   * Get commission details
   */
  static async getCommission(ledgerId: number) {
    return CommissionLedger.query()
      .where('id', ledgerId)
      .preload('conversion')
      .preload('affiliateLink')
      .first()
  }

  /**
   * Approve commission
   */
  static async approveCommission(
    ledgerId: number,
    adminId: number
  ): Promise<CommissionLedger> {
    const ledger = await CommissionLedger.find(ledgerId)
    if (!ledger) {
      throw new Error('Commission not found')
    }

    if (ledger.status !== 'pending') {
      throw new Error('Only pending commissions can be approved')
    }

    await ledger
      .merge({
        status: 'approved',
        approvedAt: DateTime.now(),
        approvedByAdminId: adminId,
      })
      .save()

    return ledger
  }

  /**
   * Reject commission
   */
  static async rejectCommission(
    ledgerId: number,
    reason: string
  ): Promise<CommissionLedger> {
    const ledger = await CommissionLedger.find(ledgerId)
    if (!ledger) {
      throw new Error('Commission not found')
    }

    if (ledger.status !== 'pending') {
      throw new Error('Only pending commissions can be rejected')
    }

    await ledger
      .merge({
        status: 'rejected',
        rejectedAt: DateTime.now(),
        rejectionReason: reason,
      })
      .save()

    return ledger
  }

  /**
   * Mark commission as paid
   */
  static async markAsPaid(
    ledgerId: number,
    adminId: number
  ): Promise<CommissionLedger> {
    const ledger = await CommissionLedger.find(ledgerId)
    if (!ledger) {
      throw new Error('Commission not found')
    }

    if (ledger.status !== 'approved') {
      throw new Error('Only approved commissions can be marked as paid')
    }

    await ledger
      .merge({
        status: 'paid',
        paidAt: DateTime.now(),
        paidByAdminId: adminId,
      })
      .save()

    return ledger
  }

  /**
   * File dispute on commission
   */
  static async fileDispute(
    ledgerId: number,
    userId: number,
    reason: string
  ): Promise<CommissionLedger> {
    const ledger = await CommissionLedger.find(ledgerId)
    if (!ledger) {
      throw new Error('Commission not found')
    }

    if (ledger.status === 'paid' || ledger.status === 'rejected') {
      throw new Error('Cannot dispute paid or rejected commissions')
    }

    await ledger
      .merge({
        status: 'disputed',
        disputedAt: DateTime.now(),
        disputedByUserId: userId,
        disputeReason: reason,
      })
      .save()

    return ledger
  }

  /**
   * Get commission summary stats
   */
  static async getAffiliateStats(affiliateId: number) {
    const commissions = await CommissionLedger.query()
      .where('affiliate_id', affiliateId)
      .select('status')

    const stats = {
      total: commissions.length,
      pending: 0,
      approved: 0,
      paid: 0,
      rejected: 0,
      disputed: 0,
      pendingAmount: 0,
      approvedAmount: 0,
      paidAmount: 0,
    }

    for (const ledger of commissions) {
      stats[ledger.status as keyof typeof stats] =
        (stats[ledger.status as keyof typeof stats] as number) + 1

      if (ledger.status === 'pending') {
        stats.pendingAmount += ledger.netCommission
      } else if (ledger.status === 'approved') {
        stats.approvedAmount += ledger.netCommission
      } else if (ledger.status === 'paid') {
        stats.paidAmount += ledger.netCommission
      }
    }

    return stats
  }

  /**
   * Get campaign commission stats
   */
  static async getCampaignStats(campaignId: number) {
    const commissions = await CommissionLedger.query().where('campaign_id', campaignId)

    let totalCommissions = 0
    let approvedCommissions = 0
    let paidCommissions = 0

    for (const ledger of commissions) {
      totalCommissions += ledger.netCommission
      if (ledger.status === 'approved') approvedCommissions += ledger.netCommission
      if (ledger.status === 'paid') paidCommissions += ledger.netCommission
    }

    return {
      totalCommissions,
      approvedCommissions,
      paidCommissions,
      totalEntries: commissions.length,
    }
  }

  /**
   * Bulk approve commissions for campaign
   */
  static async bulkApproveCommissions(
    campaignId: number,
    adminId: number
  ): Promise<number> {
    const commissions = await CommissionLedger.query()
      .where('campaign_id', campaignId)
      .where('status', 'pending')

    let approved = 0
    for (const ledger of commissions) {
      await ledger
        .merge({
          status: 'approved',
          approvedAt: DateTime.now(),
          approvedByAdminId: adminId,
        })
        .save()

      approved++
    }

    return approved
  }
}
