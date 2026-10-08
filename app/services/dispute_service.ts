import Dispute from '#models/dispute'
import { DateTime } from 'luxon'

export interface DisputeResolution {
  disputeId: number
  resolution: 'approved' | 'rejected' | 'partial'
  amountAwarded: number
  notes: string
}

export default class DisputeService {
  /**
   * Create a dispute (supports both individual args and object arg)
   */
  static async createDispute(
    typeOrData: 'commission' | 'chargeback' | 'conversion' | 'payout' | Record<string, any>,
    initiatorId?: number,
    respondentId?: number,
    amount?: number,
    reason?: string,
    relatedId?: number
  ) {
    let disputeData: Record<string, any>

    if (typeof typeOrData === 'object') {
      disputeData = typeOrData
    } else {
      disputeData = {
        type: typeOrData,
        initiatorId,
        respondentId,
        amount,
        reason,
        relatedConversionId: relatedId,
      }
    }

    const dispute = await Dispute.create({
      type: disputeData.type,
      initiatorId: disputeData.initiatorId,
      respondentId: disputeData.respondentId,
      amount: disputeData.amount,
      reason: disputeData.reason,
      relatedConversionId: disputeData.relatedConversionId,
      status: 'open',
      priority: this.calculatePriority(disputeData.type, disputeData.amount),
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
   * Get open disputes with pagination
   */
  static async getOpenDisputes(page = 1, limit = 20) {
    return Dispute.query()
      .where('status', 'open')
      .orderBy('priority', 'desc')
      .orderBy('created_at', 'asc')
      .preload('initiator')
      .preload('respondent')
      .paginate(page, limit)
  }

  /**
   * Get disputes for user with pagination
   */
  static async getUserDisputes(userId: number, page = 1, limit = 20) {
    return Dispute.query()
      .where((query) => {
        query.where('initiator_id', userId).orWhere('respondent_id', userId)
      })
      .orderBy('created_at', 'desc')
      .preload('initiator')
      .preload('respondent')
      .paginate(page, limit)
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
  static async escalateDispute(disputeId: number, escalatedToUserId: number, _userId: number, notes: string) {
    const dispute = await Dispute.findOrFail(disputeId)

    dispute.status = 'escalated'
    dispute.escalatedAt = DateTime.now()
    dispute.escalatedToUserId = escalatedToUserId
    dispute.resolutionNotes = (dispute.resolutionNotes || '') + '\nEscalated: ' + notes
    await dispute.save()

    return dispute
  }

  /**
   * Resolve dispute
   */
  static async resolveDispute(
    disputeId: number,
    _userId: number,
    resolutionType: 'rejection' | 'adjustment' | 'reversal' | 'manual_approval',
    resolvedAmount: number,
    notes: string
  ) {
    const dispute = await Dispute.findOrFail(disputeId)

    dispute.status = 'resolved'
    dispute.resolutionType = resolutionType
    dispute.resolvedAmount = resolvedAmount
    dispute.resolutionNotes = notes
    dispute.resolvedAt = DateTime.now()
    await dispute.save()

    return dispute
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
      .whereNotNull('resolved_at')

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
    const paginated = await this.getOpenDisputes(1, 1000)
    const openDisputes = paginated.all?.() || []

    for (const dispute of openDisputes) {
      // Rule 1: Small commission disputes with clear evidence
      if (
        dispute.type === 'commission' &&
        dispute.amount < 50 &&
        (dispute.evidence || []).length >= 2
      ) {
        await this.resolveDispute(
          dispute.id,
          0,
          'manual_approval',
          dispute.amount,
          'Auto-resolved: sufficient evidence provided'
        )
      }

      // Rule 2: Chargeback disputes (always escalate to admin)
      if (dispute.type === 'chargeback') {
        await this.escalateDispute(dispute.id, 0, 0, 'Automatic escalation: chargeback disputes require manual review')
      }
    }
  }

  /**
   * Get dispute with full details
   */
  static async getDisputeWithDetails(disputeId: number) {
    return Dispute.query()
      .where('id', disputeId)
      .preload('initiator')
      .preload('respondent')
      .firstOrFail()
  }

  /**
   * Add comment to dispute
   */
  static async addComment(disputeId: number, _userId: number, comment: string, _isInternal: boolean) {
    const dispute = await Dispute.findOrFail(disputeId)
    dispute.supportingNotes = (dispute.supportingNotes || '') + '\n' + comment
    await dispute.save()
    return { comment, createdAt: DateTime.now() }
  }

  /**
   * Update dispute status
   */
  static async updateDisputeStatus(disputeId: number, status: 'open' | 'escalated' | 'resolved' | 'closed', _userId: number, notes: string) {
    const dispute = await Dispute.findOrFail(disputeId)
    dispute.status = status
    dispute.resolutionNotes = (dispute.resolutionNotes || '') + '\n' + notes
    await dispute.save()
    return dispute
  }

  /**
   * Assign dispute to user
   */
  static async assignDispute(disputeId: number, assignedToUserId: number, _userId: number, notes: string) {
    const dispute = await Dispute.findOrFail(disputeId)
    dispute.escalatedToUserId = assignedToUserId
    dispute.resolutionNotes = (dispute.resolutionNotes || '') + '\n' + notes
    await dispute.save()
    return dispute
  }

  /**
   * Get escalated disputes
   */
  static async getEscalatedDisputes(page = 1, limit = 20) {
    return Dispute.query()
      .where('status', 'escalated')
      .orderBy('created_at', 'desc')
      .preload('initiator')
      .preload('respondent')
      .paginate(page, limit)
  }

  /**
   * Get disputes by filter
   */
  static async getDisputesByFilter(
    type?: string,
    status?: string,
    priority?: string,
    page = 1,
    limit = 20
  ) {
    let query = Dispute.query()

    if (type) query = query.where('type', type)
    if (status) query = query.where('status', status)
    if (priority) query = query.where('priority', priority)

    return query
      .orderBy('created_at', 'desc')
      .preload('initiator')
      .preload('respondent')
      .paginate(page, limit)
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats() {
    const disputes = await Dispute.query()
    return {
      total: disputes.length,
      open: disputes.filter((d) => d.status === 'open').length,
      escalated: disputes.filter((d) => d.status === 'escalated').length,
      resolved: disputes.filter((d) => d.status === 'resolved').length,
      totalAmount: disputes.reduce((sum, d) => sum + d.amount, 0),
    }
  }

  /**
   * Request dispute approval
   */
  static async requestApproval(disputeId: number, userId: number, reason: string) {
    const dispute = await Dispute.findOrFail(disputeId)
    dispute.resolutionNotes = (dispute.resolutionNotes || '') + '\nApproval requested: ' + reason
    await dispute.save()
    return {
      disputeId,
      requestedByUserId: userId,
      reason,
      requestedAt: DateTime.now().toISO(),
    }
  }

  /**
   * Approve dispute
   */
  static async approveDispute(approvalId: number, _userId: number, reason: string) {
    return {
      approvalId,
      status: 'approved',
      reason,
      approvedAt: DateTime.now().toISO(),
    }
  }

  /**
   * Reject dispute
   */
  static async rejectDispute(approvalId: number, _userId: number, reason: string) {
    return {
      approvalId,
      status: 'rejected',
      reason,
      rejectedAt: DateTime.now().toISO(),
    }
  }
}
