import type { HttpContext } from '@adonisjs/core/http'
import CommissionService from '#services/commission_service'
import CommissionLedger from '#models/commission_ledger'

export default class CommissionLedgerController {
  /**
   * Get affiliate commissions
   */
  async index({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { status, campaignId, page = 1, limit = 20 } = request.qs()

    try {
      const commissions = await CommissionService.getAffiliateCommissions(
        user.id,
        status,
        campaignId ? parseInt(campaignId) : undefined,
        page,
        limit
      )

      return response.ok({ success: true, data: commissions })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch commissions'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get commission details
   */
  async show({ params, auth, response }: HttpContext) {
    const user = auth.user!

    try {
      const ledger = await CommissionLedger.find(params.id)

      if (!ledger) {
        return response.notFound({ error: 'Commission not found' })
      }

      if (ledger.affiliateId !== user.id && user.role !== 'admin') {
        return response.forbidden({ error: 'You cannot view this commission' })
      }

      const details = await CommissionService.getCommission(ledger.id)

      return response.ok({ success: true, data: details })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch commission'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * File dispute on commission
   */
  async dispute({ params, request, auth, response }: HttpContext) {
    const user = auth.user!
    const { reason } = request.only(['reason'])

    try {
      const ledger = await CommissionLedger.find(params.id)

      if (!ledger) {
        return response.notFound({ error: 'Commission not found' })
      }

      if (ledger.affiliateId !== user.id && user.role !== 'admin') {
        return response.forbidden({ error: 'You cannot dispute this commission' })
      }

      const updated = await CommissionService.fileDispute(ledger.id, user.id, reason)

      return response.ok({ success: true, data: updated, message: 'Dispute filed' })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to file dispute'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get commission stats
   */
  async getStats({ auth, response }: HttpContext) {
    const user = auth.user!

    try {
      const stats = await CommissionService.getAffiliateStats(user.id)

      return response.ok({ success: true, data: stats })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch stats'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Approve commission (admin only)
   */
  async approve({ params, auth, response }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'admin') {
      return response.unauthorized({ error: 'Only admins can approve commissions' })
    }

    try {
      const ledger = await CommissionService.approveCommission(params.id, user.id)

      return response.ok({ success: true, data: ledger, message: 'Commission approved' })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to approve commission'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Reject commission (admin only)
   */
  async reject({ params, request, auth, response }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'admin') {
      return response.unauthorized({ error: 'Only admins can reject commissions' })
    }

    const { reason } = request.only(['reason'])

    try {
      const ledger = await CommissionService.rejectCommission(params.id, reason)

      return response.ok({ success: true, data: ledger, message: 'Commission rejected' })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to reject commission'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Mark commission as paid (admin only)
   */
  async markAsPaid({ params, auth, response }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'admin') {
      return response.unauthorized({ error: 'Only admins can mark commissions as paid' })
    }

    try {
      const ledger = await CommissionService.markAsPaid(params.id, user.id)

      return response.ok({ success: true, data: ledger, message: 'Commission marked as paid' })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to mark as paid'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Bulk approve commissions (admin only)
   */
  async bulkApprove({ request, auth, response }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'admin') {
      return response.unauthorized({ error: 'Only admins can approve commissions' })
    }

    const { campaignId } = request.only(['campaignId'])

    try {
      const count = await CommissionService.bulkApproveCommissions(campaignId, user.id)

      return response.ok({
        success: true,
        data: { approved: count },
        message: `${count} commissions approved`,
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to bulk approve'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get campaign commission stats (admin/vendor)
   */
  async campaignStats({ params, response }: HttpContext) {
    try {
      const stats = await CommissionService.getCampaignStats(params.campaignId)

      return response.ok({ success: true, data: stats })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch campaign stats'
      return response.badRequest({ error: msg })
    }
  }
}
