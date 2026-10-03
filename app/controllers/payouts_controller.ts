import type { HttpContext } from '@adonisjs/core/http'
import PayoutService from '#services/payout_service'
import PayoutRequest from '#models/payout_request'

export default class PayoutsController {
  /**
   * Get wallet info (affiliate only)
   */
  async wallet({ auth, response }: HttpContext) {
    const user = auth.user!

    try {
      const stats = await PayoutService.getWalletStats(user.id)

      return response.ok({ success: true, data: stats })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch wallet'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Request payout (affiliate only)
   */
  async requestPayout({ request, auth, response }: HttpContext) {
    const user = auth.user!
    const { amount, paymentMethodId } = request.only(['amount', 'paymentMethodId'])

    try {
      const payout = await PayoutService.requestPayout(user.id, amount, paymentMethodId)

      return response.created({ success: true, data: payout })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to request payout'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get payout history (affiliate)
   */
  async history({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { status, page = 1, limit = 20 } = request.qs()

    try {
      const payouts = await PayoutService.getPayoutHistory(user.id, status, page, limit)

      return response.ok({ success: true, data: payouts })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch history'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get payout request details
   */
  async show({ params, auth, response }: HttpContext) {
    const user = auth.user!

    try {
      const payout = await PayoutRequest.find(params.id)

      if (!payout) {
        return response.notFound({ error: 'Payout request not found' })
      }

      if (payout.affiliateId !== user.id && user.role !== 'admin') {
        return response.forbidden({ error: 'You cannot view this payout' })
      }

      return response.ok({ success: true, data: payout })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch payout'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Add payout method (affiliate)
   */
  async addPaymentMethod({ request, auth, response }: HttpContext) {
    const user = auth.user!
    const { methodType, accountHolderName, ...methodDetails } = request.all()

    try {
      const method = await PayoutService.addPayoutMethod(
        user.id,
        methodType,
        accountHolderName,
        methodDetails
      )

      return response.created({ success: true, data: method })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to add payment method'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Get payout methods (affiliate)
   */
  async paymentMethods({ auth, response }: HttpContext) {
    const user = auth.user!

    try {
      const methods = await PayoutService.getPayoutMethods(user.id)

      return response.ok({ success: true, data: methods })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch payment methods'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Approve payout (admin only)
   */
  async approve({ params, auth, response }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'admin') {
      return response.unauthorized({ error: 'Only admins can approve payouts' })
    }

    try {
      const payout = await PayoutService.approvePayout(params.id, user.id)

      return response.ok({ success: true, data: payout, message: 'Payout approved' })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to approve payout'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Reject payout (admin only)
   */
  async reject({ params, request, auth, response }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'admin') {
      return response.unauthorized({ error: 'Only admins can reject payouts' })
    }

    const { reason } = request.only(['reason'])

    try {
      const payout = await PayoutService.rejectPayout(params.id, reason)

      return response.ok({ success: true, data: payout, message: 'Payout rejected' })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to reject payout'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Mark payout as processing (admin only)
   */
  async process({ params, auth, response }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'admin') {
      return response.unauthorized({ error: 'Only admins can process payouts' })
    }

    try {
      const payout = await PayoutService.markAsProcessing(params.id)

      return response.ok({ success: true, data: payout, message: 'Payout marked as processing' })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to process payout'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Complete payout (admin only)
   */
  async complete({ params, request, auth, response }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'admin') {
      return response.unauthorized({ error: 'Only admins can complete payouts' })
    }

    const { referenceNumber } = request.only(['referenceNumber'])

    try {
      const payout = await PayoutService.completePayout(params.id, referenceNumber)

      return response.ok({ success: true, data: payout, message: 'Payout completed' })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to complete payout'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * Mark payout as failed (admin only)
   */
  async fail({ params, request, auth, response }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'admin') {
      return response.unauthorized({ error: 'Only admins can mark payouts as failed' })
    }

    const { reason } = request.only(['reason'])

    try {
      const payout = await PayoutService.failPayout(params.id, reason)

      return response.ok({ success: true, data: payout, message: 'Payout marked as failed' })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to mark payout as failed'
      return response.badRequest({ error: msg })
    }
  }

  /**
   * List all payouts (admin only)
   */
  async adminIndex({ request, auth, response }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'admin') {
      return response.unauthorized({ error: 'Only admins can view all payouts' })
    }

    const { status, page = 1, limit = 20 } = request.qs()

    try {
      const payouts = await PayoutService.getPayoutHistory(undefined, status, page, limit)

      return response.ok({ success: true, data: payouts })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch payouts'
      return response.badRequest({ error: msg })
    }
  }
}
