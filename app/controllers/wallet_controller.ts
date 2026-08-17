import { WalletService } from '#services/wallet_service'
import { requestPayoutValidator, updatePayoutValidator } from '#validators/wallet'
import type { HttpContext } from '@adonisjs/core/http'

export default class WalletController {
  /**
   * GET /api/wallet
   * Return wallet balances, recent transactions, and payout history.
   */
  async show({ auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor' && user.role !== 'affiliate') {
      return response
        .status(403)
        .json({ error: 'Wallet access is limited to vendors and affiliates' })
    }

    const summary = await WalletService.getSummary(user.id)
    return response.json({ success: true, data: summary })
  }

  /**
   * POST /api/wallet/payouts
   * Request a withdrawal from available balance.
   */
  async requestPayout({ auth, request, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor' && user.role !== 'affiliate') {
      return response.status(403).json({ error: 'Only vendors and affiliates can request payouts' })
    }

    const payload = await request.validateUsing(requestPayoutValidator)

    try {
      const payout = await WalletService.requestPayout(user.id, payload.amount)
      return response.status(201).json({
        success: true,
        message: 'Payout request submitted',
        data: payout.serialize(),
      })
    } catch (error: any) {
      return response.status(400).json({ error: error?.message || 'Payout request failed' })
    }
  }

  /**
   * GET /api/admin/payouts
   * List payout requests for admin review.
   */
  async adminIndex({ request, response }: HttpContext) {
    const status = request.input('status', 'pending')
    const payouts = await WalletService.listPayoutRequests(status)
    return response.json({
      success: true,
      data: payouts.map((p) => ({
        ...p.serialize(),
        user: p.user
          ? {
              id: p.user.id,
              fullName: p.user.fullName,
              email: p.user.email,
              role: p.user.role,
            }
          : null,
      })),
    })
  }

  /**
   * PUT /api/admin/payouts/:id
   * Approve, mark paid, or reject a payout request.
   */
  async adminUpdate({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updatePayoutValidator)

    try {
      const payout = await WalletService.updatePayoutStatus(
        Number(params.id),
        payload.status,
        payload.adminNotes
      )
      return response.json({
        success: true,
        message: `Payout ${payload.status}`,
        data: payout.serialize(),
      })
    } catch (error: any) {
      return response.status(400).json({ error: error?.message || 'Failed to update payout' })
    }
  }
}
