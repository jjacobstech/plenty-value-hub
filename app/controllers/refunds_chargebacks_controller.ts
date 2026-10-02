import RefundChargeback from '#models/refund_chargeback'
import CommissionLedger from '#models/commission_ledger'
import VendorConversion from '#models/vendor_conversion'
import Order from '#models/order'
import type { HttpContext } from '@adonisjs/core/http'

export default class RefundsChargebacksController {
  /**
   * Report a refund or chargeback
   * Vendors use this endpoint to report refunds from their systems
   */
  async report({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Only vendors can report refunds' })
    }

    const {
      type,
      external_id,
      external_reference,
      original_amount,
      refund_amount,
      reason,
      customer_reason,
      order_id,
      vendor_conversion_id,
      metadata,
    } = request.all()

    // Validate
    if (!type || !external_id || !original_amount || !refund_amount) {
      return response.status(400).json({
        error: 'Missing required fields: type, external_id, original_amount, refund_amount',
      })
    }

    // Check for duplicate
    const existing = await RefundChargeback.query()
      .where('external_id', external_id)
      .where('vendor_id', user.id)
      .first()

    if (existing) {
      return response.status(409).json({
        error: 'Refund with this ID already reported',
        data: existing.serialize(),
      })
    }

    const refund = await RefundChargeback.create({
      vendorId: user.id,
      type,
      externalId: external_id,
      externalReference: external_reference,
      originalAmount: Number(original_amount),
      refundAmount: Number(refund_amount),
      reason,
      customerReason: customer_reason,
      orderId: order_id,
      vendorConversionId: vendor_conversion_id,
      initiatedAt: new Date(),
      metadata,
      currency: 'NGN',
    })

    return response.status(201).json({
      success: true,
      message: 'Refund reported',
      data: refund.serialize(),
    })
  }

  /**
   * List refunds and chargebacks
   */
  async index({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const status = request.input('status')
    const type = request.input('type')
    const vendorId = request.input('vendor_id')

    let query = RefundChargeback.query()

    if (user.role === 'vendor') {
      query = query.where('vendor_id', user.id)
    } else if (user.role === 'admin' && vendorId) {
      query = query.where('vendor_id', vendorId)
    }

    if (status) query = query.where('status', status)
    if (type) query = query.where('type', type)

    const refunds = await query
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    return response.json({
      success: true,
      data: refunds.all(),
      pagination: {
        total: refunds.total,
        perPage: refunds.perPage,
        currentPage: refunds.currentPage,
        lastPage: refunds.lastPage,
      },
    })
  }

  /**
   * Get refund details
   */
  async show({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const refund = await RefundChargeback.findOrFail(params.id)

    if (user.role === 'vendor' && refund.vendorId !== user.id) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    return response.json({
      success: true,
      data: refund.serialize(),
    })
  }

  /**
   * Verify refund (admin)
   */
  async verify({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can verify refunds' })
    }

    const refund = await RefundChargeback.findOrFail(params.id)

    if (refund.status !== 'pending') {
      return response.status(400).json({ error: 'Can only verify pending refunds' })
    }

    refund.markAsVerified()
    await refund.save()

    return response.json({
      success: true,
      message: 'Refund verified',
      data: refund.serialize(),
    })
  }

  /**
   * Approve refund and reverse commission
   */
  async approve({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can approve refunds' })
    }

    const refund = await RefundChargeback.findOrFail(params.id)

    if (!['pending', 'verified'].includes(refund.status)) {
      return response.status(400).json({ error: 'Only pending or verified refunds can be approved' })
    }

    const notes = request.input('notes')

    refund.markAsApproved(user.id, notes)
    await refund.save()

    // Find and reverse associated commission
    let commission: CommissionLedger | null = null
    if (refund.commissionLedgerId) {
      commission = await CommissionLedger.find(refund.commissionLedgerId)
    } else if (refund.vendorConversionId) {
      // Find commission from vendor conversion
      const commissions = await CommissionLedger.query()
        .where('vendor_conversion_id', refund.vendorConversionId)
        .where('status', 'approved')
        .first()
      commission = commissions
    }

    if (commission && !commission.isReversed()) {
      commission.markAsReversed('Refund issued', refund.isChargeback() ? 'chargeback' : 'refund')
      await commission.save()

      refund.markCommissionReversed(commission.amount)
      await refund.save()
    }

    return response.json({
      success: true,
      message: 'Refund approved and commission reversed',
      data: refund.serialize(),
    })
  }

  /**
   * Reject refund
   */
  async reject({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can reject refunds' })
    }

    const refund = await RefundChargeback.findOrFail(params.id)

    if (!['pending', 'verified'].includes(refund.status)) {
      return response.status(400).json({ error: 'Can only reject pending or verified refunds' })
    }

    const reason = request.input('reason', 'No reason provided')
    refund.markAsRejected(reason)
    await refund.save()

    return response.json({
      success: true,
      message: 'Refund rejected',
      data: refund.serialize(),
    })
  }

  /**
   * Complete refund processing
   */
  async complete({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can complete refunds' })
    }

    const refund = await RefundChargeback.findOrFail(params.id)

    if (refund.status !== 'approved') {
      return response.status(400).json({ error: 'Can only complete approved refunds' })
    }

    refund.markAsCompleted()
    await refund.save()

    return response.json({
      success: true,
      message: 'Refund completed',
      data: refund.serialize(),
    })
  }

  /**
   * Get refund statistics
   */
  async getStats({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const vendorId = request.input('vendor_id')

    let query = RefundChargeback.query()

    if (user.role === 'vendor') {
      query = query.where('vendor_id', user.id)
    } else if (user.role === 'admin' && vendorId) {
      query = query.where('vendor_id', vendorId)
    }

    const refunds = await query

    const refundsByStatus = {
      pending: refunds.filter((r) => r.status === 'pending').length,
      verified: refunds.filter((r) => r.status === 'verified').length,
      approved: refunds.filter((r) => r.status === 'approved').length,
      rejected: refunds.filter((r) => r.status === 'rejected').length,
      completed: refunds.filter((r) => r.status === 'completed').length,
    }

    const refundsByType = {
      refund: refunds.filter((r) => r.type === 'refund').length,
      chargeback: refunds.filter((r) => r.type === 'chargeback').length,
      partial_refund: refunds.filter((r) => r.type === 'partial_refund').length,
    }

    const totalRefunded = refunds
      .filter((r) => r.status === 'completed')
      .reduce((sum, r) => sum + r.refundAmount, 0)

    const totalCommissionReversed = refunds
      .filter((r) => r.commissionReversed)
      .reduce((sum, r) => sum + (r.commissionAmountReversed || 0), 0)

    return response.json({
      success: true,
      data: {
        total: refunds.length,
        byStatus: refundsByStatus,
        byType: refundsByType,
        totalRefunded,
        totalCommissionReversed,
        chargebackRate:
          refundsByType.chargeback > 0
            ? ((refundsByType.chargeback / refunds.length) * 100).toFixed(2)
            : '0',
      },
    })
  }
}
