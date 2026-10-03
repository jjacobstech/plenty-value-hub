import Dispute from '#models/dispute'
import User from '#models/user'
import { DateTime } from 'luxon'

export interface DisputeResolution {
  disputeId: number
  resolution: 'approved' | 'rejected' | 'partial'
  amountAwarded: number
  notes: string
}

export default class DisputeService {
  /**
   * Create a dispute
   */
  static async createDispute(
    type: 'commission' | 'chargeback' | 'conversion' | 'payout',
    initiatorId: number,
    respondentId: number,
    amount: number,
    reason: string,
    relatedId?: number
  ) {
    const dispute = await Dispute.create({
      type,
      initiatorId,
      respondentId,
      amount,
      reason,
      relatedConversionId: relatedId,
      status: 'open',
      priority: this.calculatePriority(type, amount),
      createdAt: DateTime.now(),
    })

    return dispute
  }

  /**
   * Calculate dispute priority
   */
  private static calculatePriority(type: string, amount: number): 'low' | 'medium' | 'high' | 'critical' {
    if (type === 'chargeback') return 'critical'
    if (amount > 1000) return 'high'
    if (amount > 100) return 'medium'
    return 'low'
  }

  /**
   * Get open disputes
   */
  static async getOpenDisputes() {
    return Dispute.query()
      .where('status', 'open')
      .orderBy('priority', 'desc')
      .orderBy('created_at', 'asc')
      .preload('initiator')
      .preload('respondent')
  }

  /**
   * Get disputes for user
   */
  static async getUserDisputes(userId: number) {
    return Dispute.query()
      .where((query) => {
        query.where('initiator_id', userId).orWhere('respondent_id', userId)
      })
      .orderBy('created_at', 'desc')
      .preload('initiator')
      .preload('respondent')
  }

  /**
   * Add evidence to dispute
   */
  static async addEvidence(
    disputeId: number,
    userId: number,
    evidence: string,
    attachmentUrl?: string
  ) {
    const dispute = await Dispute.findOrFail(disputeId)

    // Ensure user is party to dispute
    if (dispute.initiatorId !== userId && dispute.respondentId !== userId) {
      throw new Error('Unauthorized to add evidence')
    }

    const evidenceEntry = {
      userId,
      timestamp: DateTime.now().toISO(),
      evidence,
      attachment: attachmentUrl,
    }

    dispute.evidence = [...(dispute.evidence || []), evidenceEntry]
    await dispute.save()

    return evidenceEntry
  }

  /**
   * Escalate dispute
   */
  static async escalateDispute(disputeId: number, reason: string) {
    const dispute = await Dispute.findOrFail(disputeId)

    dispute.status = 'escalated'
    dispute.escalatedAt = DateTime.now()
    dispute.escalationReason = reason
    await dispute.save()

    // TODO: Send notification to admin for manual review

    return dispute
  }

  /**
   * Resolve dispute
   */
  static async resolveDispute(resolution: DisputeResolution, adminNotes: string) {
    const dispute = await Dispute.findOrFail(resolution.disputeId)

    dispute.status = resolution.resolution === 'approved' ? 'resolved' : 'closed'
    dispute.resolution = resolution.resolution
    dispute.amountAwarded = resolution.amountAwarded
    dispute.adminNotes = adminNotes
    dispute.resolvedAt = DateTime.now()
    await dispute.save()

    // Handle payouts based on resolution
    if (resolution.amountAwarded > 0) {
      await this.executeDisputePayment(dispute, resolution.amountAwarded)
    }

    return dispute
  }

  /**
   * Execute payment based on dispute resolution
   */
  private static async executeDisputePayment(dispute: Dispute, amount: number) {
    // TODO: Integration with WalletService and PayoutService
    // For now, just log
    console.log(`Executing dispute payout: ${amount} to user ${dispute.respondentId}`)
  }

  /**
   * Get dispute statistics
   */
  static async getDisputeStatistics() {
    const disputes = await Dispute.query()

    const byStatus = {
      open: disputes.filter((d) => d.status === 'open').length,
      escalated: disputes.filter((d) => d.status === 'escalated').length,
      resolved: disputes.filter((d) => d.status === 'resolved').length,
      closed: disputes.filter((d) => d.status === 'closed').length,
    }

    const byType = {
      commission: disputes.filter((d) => d.type === 'commission').length,
      chargeback: disputes.filter((d) => d.type === 'chargeback').length,
      conversion: disputes.filter((d) => d.type === 'conversion').length,
      payout: disputes.filter((d) => d.type === 'payout').length,
    }

    const totalAmount = disputes.reduce((sum, d) => sum + d.amount, 0)
    const avgResolutionTime = await this.calculateAvgResolutionTime()

    return {
      totalDisputes: disputes.length,
      byStatus,
      byType,
      totalAmount,
      avgResolutionTime,
    }
  }

  /**
   * Calculate average resolution time
   */
  private static async calculateAvgResolutionTime(): Promise<number> {
    const resolved = await Dispute.query()
      .where('status', 'resolved')
      .where('resolved_at', '!=', null)

    if (resolved.length === 0) return 0

    const times = resolved.map((d) => {
      const created = DateTime.fromJSDate(d.createdAt as any)
      const resolved = DateTime.fromJSDate(d.resolvedAt as any)
      return resolved.diff(created, 'hours').hours
    })

    return times.reduce((a, b) => a + b, 0) / times.length
  }

  /**
   * Auto-resolve simple disputes (based on rules)
   */
  static async autoResolveDisputes() {
    const openDisputes = await this.getOpenDisputes()

    for (const dispute of openDisputes) {
      // Rule 1: Small commission disputes with clear evidence
      if (
        dispute.type === 'commission' &&
        dispute.amount < 50 &&
        (dispute.evidence || []).length >= 2
      ) {
        await this.resolveDispute(
          {
            disputeId: dispute.id,
            resolution: 'approved',
            amountAwarded: dispute.amount,
            notes: 'Auto-resolved: sufficient evidence provided',
          },
          'Automatic resolution based on evidence'
        )
      }

      // Rule 2: Chargeback disputes (always escalate to admin)
      if (dispute.type === 'chargeback') {
        await this.escalateDispute(dispute.id, 'Automatic escalation: chargeback disputes require manual review')
      }
    }
  }
}
