import CommissionDispute from '#models/commission_dispute'
import DisputeService from '#services/dispute_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class DisputesController {
  /**
   * File a new dispute
   */
  async fileDispute({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (!['admin', 'vendor', 'affiliate'].includes(user.role)) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const {
      commissionLedgerId,
      disputeType,
      description,
      supportingNotes,
      claimedAmount,
    } = request.all()

    try {
      const dispute = await DisputeService.createDispute({
        commissionLedgerId,
        userId: user.id,
        filedByUserId: user.id,
        disputeType,
        description,
        supportingNotes,
        claimedAmount,
      })

      return response.json({
        success: true,
        data: dispute,
      })
    } catch (error) {
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to file dispute',
      })
    }
  }

  /**
   * List user's disputes
   */
  async listUserDisputes({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const disputes = await DisputeService.getUserDisputes(user.id, page, limit)

    return response.json({
      success: true,
      data: disputes.all(),
      paging: {
        total: disputes.total,
        perPage: disputes.perPage,
        currentPage: disputes.currentPage,
        lastPage: disputes.lastPage,
      },
    })
  }

  /**
   * Get dispute details
   */
  async getDispute({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const disputeId = request.param('id')

    const dispute = await DisputeService.getDisputeWithDetails(Number(disputeId))

    if (!dispute) {
      return response.status(404).json({ error: 'Dispute not found' })
    }

    if (user.role === 'affiliate' && dispute.userId !== user.id && dispute.filedByUserId !== user.id) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    return response.json({
      success: true,
      data: dispute,
    })
  }

  /**
   * Add comment to dispute
   */
  async addComment({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const disputeId = request.param('id')
    const { comment, isInternal } = request.all()

    const dispute = await CommissionDispute.find(disputeId)

    if (!dispute) {
      return response.status(404).json({ error: 'Dispute not found' })
    }

    if (user.role === 'affiliate' && dispute.userId !== user.id && dispute.filedByUserId !== user.id) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    try {
      const newComment = await DisputeService.addComment(Number(disputeId), user.id, comment, isInternal)

      return response.json({
        success: true,
        data: newComment,
      })
    } catch (error) {
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to add comment',
      })
    }
  }

  /**
   * Get dispute comments
   */
  async getComments({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const disputeId = request.param('id')
    const page = request.input('page', 1)
    const limit = request.input('limit', 50)

    const dispute = await CommissionDispute.find(disputeId)

    if (!dispute) {
      return response.status(404).json({ error: 'Dispute not found' })
    }

    if (user.role === 'affiliate' && dispute.userId !== user.id && dispute.filedByUserId !== user.id) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const comments = await CommissionDispute.query()
      .where('id', Number(disputeId))
      .preload('comments', (q) => {
        if (user.role === 'affiliate') {
          q.where('is_internal', false)
        }
        return q.orderBy('created_at', 'desc').paginate(page, limit)
      })
      .first()

    return response.json({
      success: true,
      data: comments?.comments || [],
    })
  }

  /**
   * Update dispute status (admin only)
   */
  async updateStatus({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const disputeId = request.param('id')
    const { status, notes } = request.all()

    try {
      const dispute = await DisputeService.updateDisputeStatus(Number(disputeId), status, user.id, notes)

      return response.json({
        success: true,
        data: dispute,
      })
    } catch (error) {
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to update dispute status',
      })
    }
  }

  /**
   * Resolve a dispute (admin only)
   */
  async resolveDispute({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const disputeId = request.param('id')
    const { resolutionType, resolvedAmount, notes } = request.all()

    try {
      const dispute = await DisputeService.resolveDispute(
        Number(disputeId),
        user.id,
        resolutionType,
        resolvedAmount,
        notes
      )

      return response.json({
        success: true,
        data: dispute,
      })
    } catch (error) {
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to resolve dispute',
      })
    }
  }

  /**
   * Assign dispute (admin only)
   */
  async assignDispute({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const disputeId = request.param('id')
    const { assignedToUserId, notes } = request.all()

    try {
      const assignment = await DisputeService.assignDispute(Number(disputeId), assignedToUserId, user.id, notes)

      return response.json({
        success: true,
        data: assignment,
      })
    } catch (error) {
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to assign dispute',
      })
    }
  }

  /**
   * Escalate dispute (admin/assigned user only)
   */
  async escalateDispute({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const disputeId = request.param('id')
    const { escalatedToUserId, notes } = request.all()

    try {
      const dispute = await DisputeService.escalateDispute(Number(disputeId), escalatedToUserId, user.id, notes)

      return response.json({
        success: true,
        data: dispute,
      })
    } catch (error) {
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to escalate dispute',
      })
    }
  }

  /**
   * List open disputes (admin only)
   */
  async listOpenDisputes({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const disputes = await DisputeService.getOpenDisputes(page, limit)

    return response.json({
      success: true,
      data: disputes.all(),
      paging: {
        total: disputes.total,
        perPage: disputes.perPage,
        currentPage: disputes.currentPage,
        lastPage: disputes.lastPage,
      },
    })
  }

  /**
   * List escalated disputes (admin only)
   */
  async listEscalatedDisputes({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const disputes = await DisputeService.getEscalatedDisputes(page, limit)

    return response.json({
      success: true,
      data: disputes.all(),
      paging: {
        total: disputes.total,
        perPage: disputes.perPage,
        currentPage: disputes.currentPage,
        lastPage: disputes.lastPage,
      },
    })
  }

  /**
   * Filter disputes (admin only)
   */
  async filterDisputes({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const disputeType = request.input('dispute_type')
    const status = request.input('status')
    const priority = request.input('priority')

    const disputes = await DisputeService.getDisputesByFilter(disputeType, status, priority, page, limit)

    return response.json({
      success: true,
      data: disputes.all(),
      paging: {
        total: disputes.total,
        perPage: disputes.perPage,
        currentPage: disputes.currentPage,
        lastPage: disputes.lastPage,
      },
    })
  }

  /**
   * Get dispute dashboard stats (admin only)
   */
  async getDashboardStats({ auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const stats = await DisputeService.getDashboardStats()

    return response.json({
      success: true,
      data: stats,
    })
  }

  /**
   * Request approval for dispute resolution (admin only)
   */
  async requestApproval({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const disputeId = request.param('id')
    const { reason } = request.all()

    try {
      const approval = await DisputeService.requestApproval(Number(disputeId), user.id, reason)

      return response.json({
        success: true,
        data: approval,
      })
    } catch (error) {
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to request approval',
      })
    }
  }

  /**
   * Approve dispute resolution (admin only)
   */
  async approveDispute({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const approvalId = request.param('approvalId')
    const { reason } = request.all()

    try {
      const approval = await DisputeService.approveDispute(Number(approvalId), user.id, reason)

      return response.json({
        success: true,
        data: approval,
      })
    } catch (error) {
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to approve dispute',
      })
    }
  }

  /**
   * Reject dispute resolution (admin only)
   */
  async rejectDispute({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const approvalId = request.param('approvalId')
    const { reason } = request.all()

    try {
      const approval = await DisputeService.rejectDispute(Number(approvalId), user.id, reason)

      return response.json({
        success: true,
        data: approval,
      })
    } catch (error) {
      return response.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to reject dispute',
      })
    }
  }
}
