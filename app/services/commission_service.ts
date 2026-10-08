import Conversion from '#models/conversion'
import CommissionLedger from '#models/commission_ledger'
import AffiliateLink from '#models/affiliate_link'
import Campaign from '#models/campaign'
import WalletService from './wallet_service.js'
import { DateTime } from 'luxon'

export interface CommissionCalculation {
  conversionId: number
  affiliateId: number
  campaignId: number
  linkId: number
  baseAmount: number
  commissionRate: number
  commissionAmount: number
  status: 'pending' | 'approved' | 'paid'
}

export default class CommissionService {
  /**
   * Calculate commission for a single conversion
   */
  static async calculateConversionCommission(conversionId: number): Promise<CommissionCalculation | null> {
    const conversion = await Conversion.findOrFail(conversionId)

    if (!conversion.affiliateId) {
      return null
    }

    const link = await AffiliateLink.findOrFail(conversion.affiliateLinkId)
    const campaign = await Campaign.findOrFail(conversion.campaignId)

    // Get commission rate from link or campaign
    let commissionRate = link.commissionRate || campaign.commissionValue || 0.05

    // Apply tier-based commission if available
    const affiliateConversions = await Conversion.query()
      .where('affiliate_id', conversion.affiliateId)
      .where('campaign_id', campaign.id)
      .where('status', 'completed')
      .count('*', 'count')
      .then((r) => parseInt((r[0] as any)?.count || '0'))

    // Tier-based commission bonuses
    if (affiliateConversions > 100) {
      commissionRate *= 1.5 // 50% bonus at 100+ conversions
    } else if (affiliateConversions > 50) {
      commissionRate *= 1.25 // 25% bonus at 50+ conversions
    } else if (affiliateConversions > 10) {
      commissionRate *= 1.1 // 10% bonus at 10+ conversions
    }

    const baseAmount = conversion.orderValue || 0
    const commissionAmount = baseAmount * commissionRate

    // Create commission ledger entry
    const ledger = await CommissionLedger.create({
      affiliateId: conversion.affiliateId,
      campaignId: conversion.campaignId,
      conversionId,
      affiliateLinkId: conversion.affiliateLinkId,
      commissionType: 'conversion',
      commissionRate: commissionRate * 100,
      baseAmount,
      commissionAmount,
      status: 'pending',
      createdAt: DateTime.now(),
    })

    // Update conversion with commission info
    conversion.commissionAmount = commissionAmount
    conversion.commissionRate = commissionRate * 100
    conversion.commissionStatus = 'calculated'
    await conversion.save()

    return {
      conversionId: conversion.id,
      affiliateId: conversion.affiliateId,
      campaignId: conversion.campaignId,
      linkId: conversion.affiliateLinkId,
      baseAmount,
      commissionRate: commissionRate * 100,
      commissionAmount,
      status: 'pending',
    }
  }

  /**
   * Batch calculate commissions for pending conversions
   */
  static async calculatePendingCommissions(campaignId?: number, limit = 1000) {
    let query = Conversion.query().where('commission_status', 'pending')

    if (campaignId) {
      query = query.where('campaign_id', campaignId)
    }

    const conversions = await query.limit(limit)

    const results: CommissionCalculation[] = []
    let successCount = 0
    let errorCount = 0

    for (const conversion of conversions) {
      try {
        const result = await this.calculateConversionCommission(conversion.id)
        if (result) {
          results.push(result)
          successCount++
        }
      } catch (error) {
        console.error(`Failed to calculate commission for conversion ${conversion.id}:`, error)
        errorCount++
      }
    }

    return {
      successCount,
      errorCount,
      totalProcessed: successCount + errorCount,
      results,
    }
  }

  /**
   * Approve pending commissions
   */
  static async approvePendingCommissions(affiliateId: number, campaignId?: number) {
    let query = CommissionLedger.query()
      .where('affiliate_id', affiliateId)
      .where('status', 'pending')

    if (campaignId) {
      query = query.where('campaign_id', campaignId)
    }

    const ledgers = await query

    for (const ledger of ledgers) {
      ledger.status = 'approved'
      ledger.approvedAt = DateTime.now()
      await ledger.save()

      // Update conversion status
      const conversion = await Conversion.findOrFail(ledger.conversionId)
      conversion.commissionStatus = 'approved'
      await conversion.save()
    }

    return ledgers.length
  }

  /**
   * Release approved commissions to wallet
   */
  static async releaseCommissionsToWallet(affiliateId: number) {
    const ledgers = await CommissionLedger.query()
      .where('affiliate_id', affiliateId)
      .where('status', 'approved')
      .where('released_at', null)

    let totalReleased = 0

    for (const ledger of ledgers) {
      try {
        // Record transaction in wallet
        await WalletService.recordTransaction(
          affiliateId,
          'commission',
          ledger.commissionAmount,
          `Commission for conversion #${ledger.conversionId}`,
          {
            ledgerId: ledger.id,
            conversionId: ledger.conversionId,
          }
        )

        ledger.status = 'paid'
        ledger.releasedAt = DateTime.now()
        await ledger.save()

        totalReleased += ledger.commissionAmount
      } catch (error) {
        console.error(`Failed to release commission ledger ${ledger.id}:`, error)
      }
    }

    return totalReleased
  }

  /**
   * Get commission summary for affiliate
   */
  static async getCommissionSummary(affiliateId: number, campaignId?: number) {
    let query = CommissionLedger.query().where('affiliate_id', affiliateId)

    if (campaignId) {
      query = query.where('campaign_id', campaignId)
    }

    const ledgers = await query

    const summary = {
      totalCommissions: 0,
      pendingCommissions: 0,
      approvedCommissions: 0,
      paidCommissions: 0,
      pendingCount: 0,
      approvedCount: 0,
      paidCount: 0,
      avgCommissionRate: 0,
      byStatus: {} as Record<string, { amount: number; count: number }>,
    }

    let totalRate = 0

    for (const ledger of ledgers) {
      summary.totalCommissions += ledger.commissionAmount
      totalRate += ledger.commissionRate

      if (!summary.byStatus[ledger.status]) {
        summary.byStatus[ledger.status] = { amount: 0, count: 0 }
      }

      summary.byStatus[ledger.status].amount += ledger.commissionAmount
      summary.byStatus[ledger.status].count++

      if (ledger.status === 'pending') {
        summary.pendingCommissions += ledger.commissionAmount
        summary.pendingCount++
      } else if (ledger.status === 'approved') {
        summary.approvedCommissions += ledger.commissionAmount
        summary.approvedCount++
      } else if (ledger.status === 'paid') {
        summary.paidCommissions += ledger.commissionAmount
        summary.paidCount++
      }
    }

    summary.avgCommissionRate = ledgers.length > 0 ? totalRate / ledgers.length : 0

    return summary
  }

  static async getAffiliateCommissions(affiliateId: number) {
    return CommissionLedger.query().where('affiliate_id', affiliateId)
  }

  static async getCommission(ledgerId: number) {
    return CommissionLedger.findOrFail(ledgerId)
  }

  static async fileDispute(ledgerId: number, userId: number, reason: string) {
    const ledger = await CommissionLedger.findOrFail(ledgerId)
    ledger.status = 'disputed'
    ledger.disputeReason = reason
    ledger.disputedByUserId = userId
    ledger.disputedAt = DateTime.now()
    await ledger.save()
    return ledger
  }

  static async getAffiliateStats(affiliateId: number) {
    return this.getCommissionSummary(affiliateId)
  }

  static async approveCommission(ledgerId: number, adminId: number) {
    const ledger = await CommissionLedger.findOrFail(ledgerId)
    ledger.status = 'approved'
    ledger.approvedAt = DateTime.now()
    ledger.approvedByAdminId = adminId
    await ledger.save()
    return ledger
  }

  static async rejectCommission(ledgerId: number, reason: string) {
    const ledger = await CommissionLedger.findOrFail(ledgerId)
    ledger.status = 'rejected'
    ledger.rejectionReason = reason
    ledger.rejectedAt = DateTime.now()
    await ledger.save()
    return ledger
  }

  static async markAsPaid(ledgerId: number, adminId: number) {
    const ledger = await CommissionLedger.findOrFail(ledgerId)
    ledger.status = 'paid'
    ledger.paidAt = DateTime.now()
    ledger.paidByAdminId = adminId
    await ledger.save()
    return ledger
  }

  static async bulkApproveCommissions(campaignId: number, adminId: number) {
    const ledgers = await CommissionLedger.query().where('campaign_id', campaignId).where('status', 'pending')
    for (const ledger of ledgers) {
      await this.approveCommission(ledger.id, adminId)
    }
    return ledgers.length
  }

  static async getCampaignStats(campaignId: number) {
    const ledgers = await CommissionLedger.query().where('campaign_id', campaignId)
    let total = 0
    let approved = 0
    let paid = 0
    for (const ledger of ledgers) {
      total += ledger.commissionAmount
      if (ledger.status === 'approved') approved += ledger.commissionAmount
      if (ledger.status === 'paid') paid += ledger.commissionAmount
    }
    return { total, approved, paid, count: ledgers.length }
  }

  static async recordAffiliateConversion(conversionData: Record<string, any>) {
    return conversionData
  }

  static async handleOrderCompleted(orderId: number, amount: number) {
    return { orderId, amount, processed: true }
  }
}

export { CommissionService }
