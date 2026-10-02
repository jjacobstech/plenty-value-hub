import CommissionLedger from '#models/commission_ledger'
import VendorConversion from '#models/vendor_conversion'
import Campaign from '#models/campaign'
import type { HttpContext } from '@adonisjs/core/http'

export default class CommissionLedgerController {
  /**
   * Create commission from vendor conversion (auto-called when conversion approved)
   */
  async createFromConversion(conversion: VendorConversion, approvedBy: number): Promise<CommissionLedger> {
    const campaign = await Campaign.findOrFail(conversion.campaignId)

    const commission = await CommissionLedger.create({
      vendorId: conversion.vendorId,
      affiliateId: conversion.affiliateId || undefined,
      campaignId: conversion.campaignId,
      vendorConversionId: conversion.id,
      affiliateLinkId: conversion.affiliateLinkId,
      amount: conversion.commissionAmount || 0,
      saleAmount: conversion.amount,
      rate: campaign.commissionValue,
      commissionType: campaign.commissionType,
      status: 'approved',
      holdingDays: campaign.attributionWindowDays,
      onHold: true,
      approvedBy,
      approvalNotes: 'Auto-created from vendor conversion',
    })

    return commission
  }

  /**
   * List commissions for affiliate or vendor
   */
  async index({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const status = request.input('status')
    const campaignId = request.input('campaign_id')
    const vendorId = request.input('vendor_id')
    const onHold = request.input('on_hold')

    let query = CommissionLedger.query()

    // Filter by user role
    if (user.role === 'affiliate') {
      query = query.where('affiliate_id', user.id)
    } else if (user.role === 'vendor') {
      query = query.where('vendor_id', user.id)
    }
    // Admins can see all

    if (status) query = query.where('status', status)
    if (campaignId) query = query.where('campaign_id', campaignId)
    if (vendorId && user.role === 'admin') query = query.where('vendor_id', vendorId)
    if (onHold !== undefined) query = query.where('on_hold', onHold === 'true')

    const commissions = await query
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    return response.json({
      success: true,
      data: commissions.all(),
      pagination: {
        total: commissions.total,
        perPage: commissions.perPage,
        currentPage: commissions.currentPage,
        lastPage: commissions.lastPage,
      },
    })
  }

  /**
   * Get commission details
   */
  async show({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const commission = await CommissionLedger.findOrFail(params.id)

    // Authorization
    if (user.role === 'affiliate' && commission.affiliateId !== user.id) {
      return response.status(403).json({ error: 'Unauthorized' })
    }
    if (user.role === 'vendor' && commission.vendorId !== user.id) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    return response.json({
      success: true,
      data: commission.serialize(),
    })
  }

  /**
   * Approve commission (admin only)
   */
  async approve({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can approve commissions' })
    }

    const commission = await CommissionLedger.findOrFail(params.id)

    if (commission.status !== 'pending') {
      return response.status(400).json({ error: 'Only pending commissions can be approved' })
    }

    const notes = request.input('notes')
    commission.markAsApproved(user.id, notes)
    await commission.save()

    return response.json({
      success: true,
      message: 'Commission approved',
      data: commission.serialize(),
    })
  }

  /**
   * Mark commission as paid
   */
  async markAsPaid({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can mark commissions as paid' })
    }

    const commission = await CommissionLedger.findOrFail(params.id)

    if (!['approved', 'held'].includes(commission.status)) {
      return response.status(400).json({ error: 'Only approved or held commissions can be paid' })
    }

    const payoutId = request.input('payout_id')
    const paymentReference = request.input('payment_reference')

    if (!payoutId) {
      return response.status(400).json({ error: 'payout_id is required' })
    }

    commission.markAsPaid(payoutId, paymentReference)
    await commission.save()

    return response.json({
      success: true,
      message: 'Commission marked as paid',
      data: commission.serialize(),
    })
  }

  /**
   * Reverse commission (for refunds/chargebacks)
   */
  async reverse({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can reverse commissions' })
    }

    const commission = await CommissionLedger.findOrFail(params.id)

    if (!['approved', 'held', 'paid'].includes(commission.status)) {
      return response.status(400).json({ error: 'Can only reverse approved, held, or paid commissions' })
    }

    const reason = request.input('reason', 'No reason provided')
    const type = request.input('reversal_type', 'manual')

    commission.markAsReversed(reason, type)
    await commission.save()

    return response.json({
      success: true,
      message: 'Commission reversed',
      data: commission.serialize(),
    })
  }

  /**
   * Dispute a commission
   */
  async dispute({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const commission = await CommissionLedger.findOrFail(params.id)

    // Affiliate can dispute their own, admin can dispute any
    if (user.role === 'affiliate' && commission.affiliateId !== user.id) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    if (!['pending', 'approved', 'held'].includes(commission.status)) {
      return response.status(400).json({ error: 'Can only dispute pending, approved, or held commissions' })
    }

    const reason = request.input('reason', 'No reason provided')
    commission.markAsDisputed(reason)
    await commission.save()

    return response.json({
      success: true,
      message: 'Commission disputed',
      data: commission.serialize(),
    })
  }

  /**
   * Resolve dispute (admin only)
   */
  async resolveDispute({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can resolve disputes' })
    }

    const commission = await CommissionLedger.findOrFail(params.id)

    if (!commission.isDisputed()) {
      return response.status(400).json({ error: 'Commission is not disputed' })
    }

    const resolved = request.input('resolved', true)
    commission.resolveDispute(resolved)
    await commission.save()

    return response.json({
      success: true,
      message: `Commission dispute ${resolved ? 'resolved' : 'reopened'}`,
      data: commission.serialize(),
    })
  }

  /**
   * Release commission from hold (after holding period expires)
   */
  async releaseFromHold({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can release commissions from hold' })
    }

    const commission = await CommissionLedger.findOrFail(params.id)

    if (!commission.onHold) {
      return response.status(400).json({ error: 'Commission is not on hold' })
    }

    if (!commission.isHoldExpired()) {
      return response.status(400).json({
        error: 'Commission holding period has not expired',
        holdUntil: commission.holdUntil,
      })
    }

    commission.onHold = false
    await commission.save()

    return response.json({
      success: true,
      message: 'Commission released from hold',
      data: commission.serialize(),
    })
  }

  /**
   * Get commission statistics
   */
  async getStats({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const vendorId = request.input('vendor_id')
    const affiliateId = request.input('affiliate_id')
    const campaignId = request.input('campaign_id')
    const status = request.input('status')

    let query = CommissionLedger.query()

    // Authorization
    if (user.role === 'affiliate') {
      query = query.where('affiliate_id', user.id)
    } else if (user.role === 'vendor') {
      query = query.where('vendor_id', user.id)
    } else if (user.role === 'admin') {
      if (vendorId) query = query.where('vendor_id', vendorId)
      if (affiliateId) query = query.where('affiliate_id', affiliateId)
    }

    if (campaignId) query = query.where('campaign_id', campaignId)
    if (status) query = query.where('status', status)

    const commissions = await query

    const pending = commissions.filter((c) => c.status === 'pending')
    const approved = commissions.filter((c) => c.status === 'approved')
    const paid = commissions.filter((c) => c.status === 'paid')
    const reversed = commissions.filter((c) => c.status === 'reversed')
    const disputed = commissions.filter((c) => c.status === 'disputed')
    const onHold = commissions.filter((c) => c.onHold)

    const totalAmount = commissions.reduce((sum, c) => sum + c.amount, 0)
    const paidAmount = paid.reduce((sum, c) => sum + c.amount, 0)
    const pendingAmount = pending.reduce((sum, c) => sum + c.amount, 0)
    const reversedAmount = reversed.reduce((sum, c) => sum + c.amount, 0)

    return response.json({
      success: true,
      data: {
        total: commissions.length,
        pending: pending.length,
        approved: approved.length,
        paid: paid.length,
        reversed: reversed.length,
        disputed: disputed.length,
        onHold: onHold.length,
        totalAmount,
        paidAmount,
        pendingAmount,
        reversedAmount,
        outstandingAmount: pendingAmount + approved.reduce((sum, c) => sum + c.amount, 0),
      },
    })
  }

  /**
   * Bulk approve commissions ready for payment
   */
  async bulkApprove({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can approve commissions' })
    }

    const campaignId = request.input('campaign_id')
    const vendorId = request.input('vendor_id')

    let query = CommissionLedger.query()
      .where('status', 'pending')
      .where('on_hold', false)

    if (campaignId) query = query.where('campaign_id', campaignId)
    if (vendorId) query = query.where('vendor_id', vendorId)

    const commissions = await query
    let approved = 0

    for (const commission of commissions) {
      commission.markAsApproved(user.id, 'Bulk approved')
      await commission.save()
      approved++
    }

    return response.json({
      success: true,
      message: `${approved} commissions approved`,
      data: { approved },
    })
  }
}
