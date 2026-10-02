import CommissionDispute from '#models/commission_dispute'
import DisputeActivity from '#models/dispute_activity'
import DisputeComment from '#models/dispute_comment'
import DisputeAssignment from '#models/dispute_assignment'
import DisputeApproval from '#models/dispute_approval'
import DisputeStatistics from '#models/dispute_statistics'
import CommissionLedger from '#models/commission_ledger'
import { DateTime } from 'luxon'

interface CreateDisputeData {
  commissionLedgerId: number
  userId: number
  filedByUserId: number
  disputeType: 'amount_mismatch' | 'calculation_error' | 'missing_commission' | 'duplicate_entry' | 'payment_issue' | 'other'
  description: string
  supportingNotes?: string
  claimedAmount?: number
}

export default class DisputeService {
  /**
   * Create a new commission dispute
   */
  static async createDispute(data: CreateDisputeData): Promise<CommissionDispute> {
    const commission = await CommissionLedger.find(data.commissionLedgerId)
    if (!commission) {
      throw new Error('Commission not found')
    }

    const dispute = await CommissionDispute.create({
      commissionLedgerId: data.commissionLedgerId,
      userId: data.userId,
      filedByUserId: data.filedByUserId,
      disputeType: data.disputeType,
      description: data.description,
      supportingNotes: data.supportingNotes || null,
      disputedAmount: commission.amount || 0,
      claimedAmount: data.claimedAmount || null,
      status: 'open',
      priority: 'medium',
      resolutionType: 'pending',
      dueDate: DateTime.now().plus({ days: 14 }),
    })

    await this.logActivity(dispute.id, data.filedByUserId, 'created', null, 'open', `Dispute created for commission #${commission.id}`)
    await this.updateStatistics(data.userId)

    return dispute
  }

  /**
   * Update dispute status
   */
  static async updateDisputeStatus(
    disputeId: number,
    newStatus: string,
    userId: number,
    notes?: string
  ): Promise<CommissionDispute> {
    const dispute = await CommissionDispute.find(disputeId)
    if (!dispute) {
      throw new Error('Dispute not found')
    }

    const oldStatus = dispute.status

    await dispute.merge({
      status: newStatus,
      updatedAt: DateTime.now(),
    }).save()

    await this.logActivity(disputeId, userId, 'status_changed', oldStatus, newStatus, notes)
    await this.updateStatistics(dispute.userId)

    return dispute
  }

  /**
   * Resolve a dispute
   */
  static async resolveDispute(
    disputeId: number,
    resolvedByUserId: number,
    resolutionType: 'rejection' | 'adjustment' | 'reversal' | 'manual_approval',
    resolvedAmount?: number,
    notes?: string
  ): Promise<CommissionDispute> {
    const dispute = await CommissionDispute.find(disputeId)
    if (!dispute) {
      throw new Error('Dispute not found')
    }

    const previousStatus = dispute.status

    await dispute.merge({
      status: 'resolved',
      resolutionType,
      resolvedByUserId,
      resolvedAmount: resolvedAmount || dispute.disputedAmount,
      resolvedAt: DateTime.now(),
      resolutionNotes: notes || null,
    }).save()

    await this.logActivity(disputeId, resolvedByUserId, 'resolved', previousStatus, 'resolved', notes)
    await this.updateStatistics(dispute.userId)

    return dispute
  }

  /**
   * Add comment to dispute
   */
  static async addComment(
    disputeId: number,
    userId: number,
    comment: string,
    isInternal = false
  ): Promise<DisputeComment> {
    const dispute = await CommissionDispute.find(disputeId)
    if (!dispute) {
      throw new Error('Dispute not found')
    }

    const newComment = await DisputeComment.create({
      disputeId,
      userId,
      comment,
      isInternal,
    })

    await this.logActivity(disputeId, userId, 'comment_added', null, null, `Comment added by user`)

    return newComment
  }

  /**
   * Assign dispute to a user
   */
  static async assignDispute(
    disputeId: number,
    assignedToUserId: number,
    assignedByUserId: number,
    notes?: string
  ): Promise<DisputeAssignment> {
    const dispute = await CommissionDispute.find(disputeId)
    if (!dispute) {
      throw new Error('Dispute not found')
    }

    const assignment = await DisputeAssignment.create({
      disputeId,
      assignedToUserId,
      assignedByUserId,
      assignmentNotes: notes || null,
      assignedAt: DateTime.now(),
      isActive: true,
    })

    await this.logActivity(disputeId, assignedByUserId, 'assigned', null, null, `Assigned to user ${assignedToUserId}`)

    return assignment
  }

  /**
   * Unassign dispute from a user
   */
  static async unassignDispute(assignmentId: number): Promise<void> {
    const assignment = await DisputeAssignment.find(assignmentId)
    if (!assignment) {
      throw new Error('Assignment not found')
    }

    await assignment.merge({
      isActive: false,
      unassignedAt: DateTime.now(),
    }).save()
  }

  /**
   * Escalate a dispute
   */
  static async escalateDispute(
    disputeId: number,
    escalatedToUserId: number,
    userId: number,
    notes?: string
  ): Promise<CommissionDispute> {
    const dispute = await CommissionDispute.find(disputeId)
    if (!dispute) {
      throw new Error('Dispute not found')
    }

    const previousPriority = dispute.priority

    await dispute.merge({
      isEscalated: true,
      escalatedAt: DateTime.now(),
      escalatedToUserId,
      priority: 'high',
    }).save()

    await this.logActivity(disputeId, userId, 'escalated', previousPriority, 'high', notes)

    return dispute
  }

  /**
   * Request approval for dispute resolution
   */
  static async requestApproval(
    disputeId: number,
    requestedByUserId: number,
    reason?: string
  ): Promise<DisputeApproval> {
    const dispute = await CommissionDispute.find(disputeId)
    if (!dispute) {
      throw new Error('Dispute not found')
    }

    const approval = await DisputeApproval.create({
      disputeId,
      requestedByUserId,
      approvalStatus: 'pending',
      approvalReason: reason || null,
    })

    return approval
  }

  /**
   * Approve dispute resolution
   */
  static async approveDispute(
    approvalId: number,
    approvedByUserId: number,
    reason?: string
  ): Promise<DisputeApproval> {
    const approval = await DisputeApproval.find(approvalId)
    if (!approval) {
      throw new Error('Approval not found')
    }

    await approval.merge({
      approvalStatus: 'approved',
      approvedByUserId,
      approvedAt: DateTime.now(),
      approvalReason: reason || null,
    }).save()

    const dispute = await CommissionDispute.find(approval.disputeId)
    if (dispute) {
      await this.logActivity(approval.disputeId, approvedByUserId, 'resolved', 'pending_approval', 'approved', reason)
    }

    return approval
  }

  /**
   * Reject dispute resolution
   */
  static async rejectDispute(
    approvalId: number,
    rejectedByUserId: number,
    reason?: string
  ): Promise<DisputeApproval> {
    const approval = await DisputeApproval.find(approvalId)
    if (!approval) {
      throw new Error('Approval not found')
    }

    await approval.merge({
      approvalStatus: 'rejected',
      approvedByUserId: rejectedByUserId,
      rejectedAt: DateTime.now(),
      rejectionReason: reason || null,
    }).save()

    return approval
  }

  /**
   * Log dispute activity
   */
  static async logActivity(
    disputeId: number,
    userId: number,
    activityType: 'created' | 'status_changed' | 'comment_added' | 'amount_updated' | 'assigned' | 'escalated' | 'resolved',
    oldValue?: string | null,
    newValue?: string | null,
    description?: string
  ): Promise<DisputeActivity> {
    const activity = await DisputeActivity.create({
      disputeId,
      userId,
      activityType,
      oldValue: oldValue || null,
      newValue: newValue || null,
      description: description || null,
    })

    return activity
  }

  /**
   * Get disputes for a user
   */
  static async getUserDisputes(userId: number, page = 1, limit = 20) {
    const query = CommissionDispute.query()
      .where((q) => {
        q.where('user_id', userId).orWhere('filed_by_user_id', userId)
      })
      .orderBy('created_at', 'desc')

    return query.paginate(page, limit)
  }

  /**
   * Get open disputes
   */
  static async getOpenDisputes(page = 1, limit = 20) {
    const disputes = await CommissionDispute.query()
      .where('status', 'open')
      .orderBy('due_date', 'asc')
      .paginate(page, limit)

    return disputes
  }

  /**
   * Get escalated disputes
   */
  static async getEscalatedDisputes(page = 1, limit = 20) {
    const disputes = await CommissionDispute.query()
      .where('is_escalated', true)
      .where('status', '!=', 'resolved')
      .orderBy('escalated_at', 'desc')
      .paginate(page, limit)

    return disputes
  }

  /**
   * Get dispute by ID with related data
   */
  static async getDisputeWithDetails(disputeId: number) {
    const dispute = await CommissionDispute.query()
      .where('id', disputeId)
      .preload('commissionLedger')
      .preload('user')
      .preload('activities')
      .preload('comments')
      .preload('assignments', (q) => q.where('is_active', true))
      .first()

    return dispute
  }

  /**
   * Update dispute statistics
   */
  static async updateStatistics(userId?: number): Promise<void> {
    if (userId) {
      const disputes = await CommissionDispute.query().where('user_id', userId)

      const stats = {
        totalDisputes: disputes.length,
        openDisputes: disputes.filter((d) => d.status === 'open').length,
        resolvedDisputes: disputes.filter((d) => d.status === 'resolved').length,
        escalatedDisputes: disputes.filter((d) => d.isEscalated).length,
        totalDisputedAmount: disputes.reduce((sum, d) => sum + (d.disputedAmount || 0), 0),
        totalResolvedAmount: disputes.reduce((sum, d) => sum + (d.resolvedAmount || 0), 0),
      }

      const avgTime = disputes
        .filter((d) => d.resolvedAt && d.createdAt)
        .reduce((sum, d) => {
          const createdDate = d.createdAt
          const resolvedDate = d.resolvedAt
          if (resolvedDate) {
            return sum + resolvedDate.diff(createdDate, 'days').days
          }
          return sum
        }, 0)

      const avgResolutionTime = disputes.length > 0 ? avgTime / disputes.length : 0

      const disputesByType: Record<string, number> = {}
      disputes.forEach((d) => {
        disputesByType[d.disputeType] = (disputesByType[d.disputeType] || 0) + 1
      })

      const disputesByStatus: Record<string, number> = {}
      disputes.forEach((d) => {
        disputesByStatus[d.status] = (disputesByStatus[d.status] || 0) + 1
      })

      let userStats = await DisputeStatistics.query().where('user_id', userId).first()

      if (!userStats) {
        userStats = await DisputeStatistics.create({
          userId,
          totalDisputes: stats.totalDisputes,
          openDisputes: stats.openDisputes,
          resolvedDisputes: stats.resolvedDisputes,
          escalatedDisputes: stats.escalatedDisputes,
          totalDisputedAmount: stats.totalDisputedAmount,
          totalResolvedAmount: stats.totalResolvedAmount,
          averageResolutionTimeDays: avgResolutionTime,
          disputesByType,
          disputesByStatus,
          lastUpdatedAt: DateTime.now(),
        })
      } else {
        await userStats.merge({
          totalDisputes: stats.totalDisputes,
          openDisputes: stats.openDisputes,
          resolvedDisputes: stats.resolvedDisputes,
          escalatedDisputes: stats.escalatedDisputes,
          totalDisputedAmount: stats.totalDisputedAmount,
          totalResolvedAmount: stats.totalResolvedAmount,
          averageResolutionTimeDays: avgResolutionTime,
          disputesByType,
          disputesByStatus,
          lastUpdatedAt: DateTime.now(),
        }).save()
      }
    }
  }

  /**
   * Get disputes by type and status
   */
  static async getDisputesByFilter(
    disputeType?: string,
    status?: string,
    priority?: string,
    page = 1,
    limit = 20
  ) {
    let query = CommissionDispute.query()

    if (disputeType) {
      query = query.where('dispute_type', disputeType)
    }
    if (status) {
      query = query.where('status', status)
    }
    if (priority) {
      query = query.where('priority', priority)
    }

    return query.orderBy('created_at', 'desc').paginate(page, limit)
  }

  /**
   * Get dispute statistics for admin dashboard
   */
  static async getDashboardStats() {
    const totalDisputes = await CommissionDispute.query().count('* as total').first()
    const openDisputes = await CommissionDispute.query().where('status', 'open').count('* as count').first()
    const resolvedDisputes = await CommissionDispute.query().where('status', 'resolved').count('* as count').first()
    const escalatedDisputes = await CommissionDispute.query().where('is_escalated', true).count('* as count').first()

    const disputesByType = await CommissionDispute.query()
      .select('dispute_type')
      .count('* as count')
      .groupBy('dispute_type')

    const disputesByStatus = await CommissionDispute.query()
      .select('status')
      .count('* as count')
      .groupBy('status')

    return {
      totalDisputes: (totalDisputes as any)?.total || 0,
      openDisputes: (openDisputes as any)?.count || 0,
      resolvedDisputes: (resolvedDisputes as any)?.count || 0,
      escalatedDisputes: (escalatedDisputes as any)?.count || 0,
      disputesByType: disputesByType.map((d: any) => ({ type: d.dispute_type, count: d.count })),
      disputesByStatus: disputesByStatus.map((d: any) => ({ status: d.status, count: d.count })),
    }
  }
}
