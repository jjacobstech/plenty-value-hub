import type { HttpContext } from '@adonisjs/core/http'
import PayoutRequest from '#models/payout_request'
import PaymentService from '#services/payment_service'
import WalletService from '#services/wallet_service'

export default class AdminPayoutController {
  /**
   * Get payouts dashboard
   */
  async index({ inertia, auth }: HttpContext) {
    const user = auth.use('web').user

    if (user?.role !== 'admin') {
      return null
    }

    const payouts = await PayoutRequest.query().orderBy('created_at', 'desc').limit(20)
    const stats = await PaymentService.getPayoutStats()

    return inertia.render('admin/AdminPayouts', {
      user,
      stats,
      payouts,
    })
  }

  /**
   * Get all payouts with filtering
   */
  async getPayouts({ request, response }: HttpContext) {
    const status = request.input('status')
    const method = request.input('method')
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    let query = PayoutRequest.query()

    if (status) query = query.where('status', status)
    if (method) query = query.where('payout_method', method)

    const payouts = await query
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    return response.json({
      success: true,
      data: payouts.all(),
      pagination: {
        total: payouts.total,
        perPage: payouts.perPage,
        currentPage: payouts.currentPage,
        lastPage: payouts.lastPage,
      },
    })
  }

  /**
   * Get single payout details
   */
  async getPayout({ params, response }: HttpContext) {
    const payout = await PayoutRequest.findOrFail(params.id)

    return response.json({
      success: true,
      data: payout,
    })
  }

  /**
   * Approve payout
   */
  async approvePayout({ params, request, response }: HttpContext) {
    const payout = await WalletService.approvePayout(parseInt(params.id))

    return response.json({
      success: true,
      data: payout,
      message: 'Payout approved',
    })
  }

  /**
   * Reject payout
   */
  async rejectPayout({ params, request, response }: HttpContext) {
    const reason = request.input('reason', 'Admin rejection')
    const payout = await WalletService.rejectPayout(parseInt(params.id), reason)

    return response.json({
      success: true,
      data: payout,
      message: 'Payout rejected',
    })
  }

  /**
   * Process payout (initiate transfer)
   */
  async processPayout({ params, response }: HttpContext) {
    try {
      const payout = await PayoutRequest.findOrFail(params.id)

      if (payout.payoutMethod === 'bank_transfer') {
        const result = await PaymentService.processBankTransfer(payout.id)
        return response.json({
          success: true,
          data: result,
          message: 'Bank transfer initiated',
        })
      } else if (payout.payoutMethod === 'paypal') {
        const result = await PaymentService.processPayPalPayout(payout.id)
        return response.json({
          success: true,
          data: result,
          message: 'PayPal payout initiated',
        })
      } else if (payout.payoutMethod === 'crypto') {
        const result = await PaymentService.processCryptoPayout(payout.id)
        return response.json({
          success: true,
          data: result,
          message: 'Crypto payout initiated',
        })
      }
    } catch (error) {
      return response.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process payout',
      })
    }
  }

  /**
   * Check transfer status
   */
  async checkStatus({ params, request, response }: HttpContext) {
    try {
      const payout = await PayoutRequest.findOrFail(params.id)

      if (!payout.transferCode) {
        return response.status(400).json({
          success: false,
          error: 'No transfer code found',
        })
      }

      const status = await PaymentService.checkTransferStatus(payout.transferCode)

      return response.json({
        success: true,
        data: status,
      })
    } catch (error) {
      return response.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check status',
      })
    }
  }

  /**
   * Verify bank account
   */
  async verifyBankAccount({ request, response }: HttpContext) {
    try {
      const accountNumber = request.input('accountNumber')
      const bankCode = request.input('bankCode')

      const account = await PaymentService.verifyBankAccount(accountNumber, bankCode)

      return response.json({
        success: true,
        data: account,
      })
    } catch (error) {
      return response.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify account',
      })
    }
  }

  /**
   * Get banks list
   */
  async getBanks({ response }: HttpContext) {
    try {
      const banks = await PaymentService.getBanksList()

      return response.json({
        success: true,
        data: banks,
      })
    } catch (error) {
      return response.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch banks',
      })
    }
  }

  /**
   * Get payout statistics
   */
  async getStats({ response }: HttpContext) {
    const stats = await PaymentService.getPayoutStats()

    return response.json({
      success: true,
      data: stats,
    })
  }

  /**
   * Handle Paystack webhook
   */
  async handleWebhook({ request, response }: HttpContext) {
    const event = request.input('event')
    const data = request.input('data')

    try {
      await PaymentService.handlePaystackWebhook(event, data)

      return response.json({
        success: true,
        message: 'Webhook processed',
      })
    } catch (error) {
      return response.status(400).json({
        success: false,
        error: 'Failed to process webhook',
      })
    }
  }
}
