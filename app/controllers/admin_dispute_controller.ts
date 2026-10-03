import type { HttpContext } from '@adonisjs/core/http'
import DisputeService from '#services/dispute_service'
import Dispute from '#models/dispute'

export default class AdminDisputeController {
  /**
   * Get disputes dashboard
   */
  async index({ inertia, auth }: HttpContext) {
    const user = auth.use('web').user

    if (user?.role !== 'admin') {
      return null
    }

    const disputes = await DisputeService.getOpenDisputes()
    const stats = await DisputeService.getDisputeStatistics()

    return inertia.render('admin/AdminDisputes', {
      user,
      stats,
      disputes,
    })
  }

  /**
   * Get all disputes with filtering
   */
  async getDisputes({ request, response }: HttpContext) {
    const status = request.input('status')
    const type = request.input('type')
    const priority = request.input('priority')

    let query = Dispute.query()

    if (status) query = query.where('status', status)
    if (type) query = query.where('type', type)
    if (priority) query = query.where('priority', priority)

    const disputes = await query.orderBy('created_at', 'desc')

    return response.json({
      success: true,
      data: disputes,
    })
  }

  /**
   * Get single dispute with evidence
   */
  async getDispute({ params, response }: HttpContext) {
    const dispute = await Dispute.query()
      .where('id', params.id)
      .preload('initiator')
      .preload('respondent')
      .firstOrFail()

    return response.json({
      success: true,
      data: dispute,
    })
  }

  /**
   * Add evidence to dispute
   */
  async addEvidence({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    const evidence = request.input('evidence')
    const attachmentUrl = request.input('attachmentUrl')

    const entry = await DisputeService.addEvidence(
      params.id,
      user.id,
      evidence,
      attachmentUrl
    )

    return response.json({
      success: true,
      data: entry,
      message: 'Evidence added',
    })
  }

  /**
   * Escalate dispute
   */
  async escalateDispute({ params, request, response }: HttpContext) {
    const reason = request.input('reason')

    const dispute = await DisputeService.escalateDispute(params.id, reason)

    return response.json({
      success: true,
      data: dispute,
      message: 'Dispute escalated',
    })
  }

  /**
   * Resolve dispute
   */
  async resolveDispute({ params, request, response }: HttpContext) {
    const resolution = request.input('resolution')
    const amountAwarded = request.input('amountAwarded', 0)
    const notes = request.input('notes', '')

    const dispute = await DisputeService.resolveDispute(
      {
        disputeId: params.id,
        resolution,
        amountAwarded,
        notes,
      },
      notes
    )

    return response.json({
      success: true,
      data: dispute,
      message: 'Dispute resolved',
    })
  }

  /**
   * Get dispute statistics
   */
  async getStats({ response }: HttpContext) {
    const stats = await DisputeService.getDisputeStatistics()

    return response.json({
      success: true,
      data: stats,
    })
  }

  /**
   * Auto-resolve eligible disputes
   */
  async autoResolve({ response }: HttpContext) {
    await DisputeService.autoResolveDisputes()

    return response.json({
      success: true,
      message: 'Auto-resolution completed',
    })
  }
}
