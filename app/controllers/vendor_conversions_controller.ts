import VendorConversion from '#models/vendor_conversion'
import Campaign from '#models/campaign'
import AffiliateLink from '#models/affiliate_link'
import FraudDetectionService from '#services/fraud_detection_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class VendorConversionsController {
  /**
   * Report a conversion from external vendor system
   * Vendors call this to submit order/sale data for affiliate tracking
   */
  async reportConversion({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const { campaignId } = params

    if (user.role !== 'vendor') {
      return response.status(403).json({ error: 'Only vendors can report conversions' })
    }

    // Verify campaign belongs to vendor
    const campaign = await Campaign.query()
      .where('id', campaignId)
      .where('vendor_id', user.id)
      .first()

    if (!campaign) {
      return response.status(404).json({ error: 'Campaign not found' })
    }

    const {
      external_order_id,
      external_reference,
      amount,
      currency = 'NGN',
      customer_email,
      customer_phone,
      customer_identifier,
      affiliate_link_code,
      metadata,
    } = request.all()

    // Validate required fields
    if (!external_order_id || !amount) {
      return response.status(400).json({
        error: 'Missing required fields: external_order_id, amount',
      })
    }

    // Check for duplicate
    const existing = await VendorConversion.query()
      .where('external_order_id', external_order_id)
      .where('campaign_id', campaignId)
      .first()

    if (existing) {
      return response.status(409).json({
        error: 'Conversion with this order ID already exists',
        data: existing.serialize(),
      })
    }

    // Look up affiliate link if code provided
    let affiliateLink: AffiliateLink | null = null
    if (affiliate_link_code) {
      affiliateLink = await AffiliateLink.query()
        .where('link_code', affiliate_link_code)
        .where('campaign_id', campaignId)
        .first()
    }

    // Create conversion record
    const conversion = await VendorConversion.create({
      vendorId: user.id,
      campaignId,
      affiliateLinkId: affiliateLink?.id,
      affiliateId: affiliateLink?.affiliateId,
      externalOrderId: external_order_id,
      externalReference: external_reference,
      amount: Number(amount),
      currency,
      customerEmail: customer_email,
      customerPhone: customer_phone,
      customerIdentifier: customer_identifier,
      affiliateLinkCode: affiliate_link_code,
      metadata,
      source: 'api',
    })

    // Run fraud detection
    await this.performFraudDetection(conversion)

    return response.status(201).json({
      success: true,
      message: 'Conversion reported',
      data: conversion.serialize(),
    })
  }

  /**
   * Get conversion details
   */
  async show({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const conversion = await VendorConversion.findOrFail(params.id)

    // Authorization: vendor can see their own, admin can see all
    if (conversion.vendorId !== user.id && user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    return response.json({
      success: true,
      data: conversion.serialize(),
    })
  }

  /**
   * List vendor's conversions with filtering
   */
  async index({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const { campaignId } = params
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const status = request.input('status')
    const source = request.input('source')
    const fromDate = request.input('from_date')
    const toDate = request.input('to_date')

    // Verify campaign belongs to vendor
    const campaign = await Campaign.query()
      .where('id', campaignId)
      .where('vendor_id', user.id)
      .first()

    if (!campaign && user.role !== 'admin') {
      return response.status(404).json({ error: 'Campaign not found' })
    }

    let query = VendorConversion.query().where('campaign_id', campaignId)

    if (status) query = query.where('status', status)
    if (source) query = query.where('source', source)
    if (fromDate) query = query.whereRaw('DATE(created_at) >= ?', [fromDate])
    if (toDate) query = query.whereRaw('DATE(created_at) <= ?', [toDate])

    const conversions = await query
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    return response.json({
      success: true,
      data: conversions.all(),
      pagination: {
        total: conversions.total,
        perPage: conversions.perPage,
        currentPage: conversions.currentPage,
        lastPage: conversions.lastPage,
      },
    })
  }

  /**
   * Perform fraud detection on conversion
   */
  private async performFraudDetection(conversion: VendorConversion): Promise<void> {
    const fraudFlags = await FraudDetectionService.detectFraud(
      conversion.campaignId,
      conversion.affiliateId || 0,
      conversion.affiliateLinkId || 0,
      conversion.amount,
      conversion.customerEmail || '',
      conversion.customerPhone || undefined,
      conversion.ipAddress || undefined,
      conversion.userAgent || undefined,
      conversion.deviceId || undefined
    )

    // Store fraud detection results
    conversion.fraudFlags = JSON.stringify(fraudFlags)
    conversion.fraudScore = fraudFlags.fraudScore
    conversion.fraudRiskLevel = fraudFlags.riskLevel
    conversion.isFraudFlagged = fraudFlags.fraudScore > 30 // Flag if score > 30

    await conversion.save()
  }

  /**
   * Calculate commission for approved conversion
   */
  private async calculateCommission(campaign: Campaign, conversion: VendorConversion): Promise<number> {
    const commissionType = campaign.commissionType as string

    switch (commissionType) {
      case 'percentage':
        return (conversion.amount * (campaign.commissionValue || 0)) / 100

      case 'fixed_amount':
        return campaign.commissionValue || 0

      case 'lead':
        return campaign.commissionValue || 0

      case 'hybrid': {
        const percentageCommission = (conversion.amount * (campaign.commissionValue || 0)) / 100
        const fixedFee = campaign.fixedFee || 0
        return percentageCommission + fixedFee
      }

      default:
        return 0
    }
  }

  /**
   * Approve a pending conversion (admin only)
   */
  async approve({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can approve conversions' })
    }

    const conversion = await VendorConversion.findOrFail(params.id)

    if (conversion.status !== 'pending') {
      return response.status(400).json({ error: 'Only pending conversions can be approved' })
    }

    // Check hold period unless overridden
    const forceApprove = request.input('force_approve', false)
    if (!forceApprove && !conversion.isHoldExpired()) {
      return response.status(400).json({
        error: 'Conversion is still in holding period',
        holdUntil: conversion.holdUntil,
      })
    }

    // Calculate commission
    const campaign = await Campaign.findOrFail(conversion.campaignId)
    const commissionAmount = await this.calculateCommission(campaign, conversion)

    // Approve
    conversion.markAsApproved(user.id, commissionAmount)
    await conversion.save()

    // Update affiliate link if applicable
    if (conversion.affiliateLinkId) {
      const affiliateLink = await AffiliateLink.find(conversion.affiliateLinkId)
      if (affiliateLink) {
        affiliateLink.conversions = (affiliateLink.conversions || 0) + 1
        affiliateLink.commissionEarned = Number((affiliateLink.commissionEarned as any) || 0) + commissionAmount as any
        await affiliateLink.save()
      }
    }

    return response.json({
      success: true,
      message: 'Conversion approved',
      data: conversion.serialize(),
    })
  }

  /**
   * Reject a conversion (admin only)
   */
  async reject({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can reject conversions' })
    }

    const conversion = await VendorConversion.findOrFail(params.id)

    if (!['pending', 'disputed'].includes(conversion.status)) {
      return response.status(400).json({ error: 'Can only reject pending or disputed conversions' })
    }

    const reason = request.input('reason', 'No reason provided')
    conversion.markAsRejected(reason)
    await conversion.save()

    return response.json({
      success: true,
      message: 'Conversion rejected',
      data: conversion.serialize(),
    })
  }

  /**
   * Reverse an approved conversion (admin only)
   */
  async reverse({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can reverse conversions' })
    }

    const conversion = await VendorConversion.findOrFail(params.id)

    if (conversion.status !== 'approved') {
      return response.status(400).json({ error: 'Only approved conversions can be reversed' })
    }

    const reason = request.input('reason', 'No reason provided')
    conversion.markAsReversed(reason)
    await conversion.save()

    // Deduct from affiliate if applicable
    if (conversion.affiliateLinkId && conversion.commissionAmount) {
      const affiliateLink = await AffiliateLink.find(conversion.affiliateLinkId)
      if (affiliateLink && affiliateLink.conversions! > 0) {
        affiliateLink.conversions = affiliateLink.conversions! - 1
        affiliateLink.commissionEarned = (Number(affiliateLink.commissionEarned as any) || 0) - conversion.commissionAmount as any
        await affiliateLink.save()
      }
    }

    return response.json({
      success: true,
      message: 'Conversion reversed',
      data: conversion.serialize(),
    })
  }

  /**
   * Dispute a conversion (vendor can initiate, admin resolves)
   */
  async dispute({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const conversion = await VendorConversion.findOrFail(params.id)

    // Vendor can dispute their own, admin can dispute any
    if (conversion.vendorId !== user.id && user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    if (!['approved', 'pending'].includes(conversion.status)) {
      return response.status(400).json({ error: 'Can only dispute approved or pending conversions' })
    }

    const reason = request.input('reason', 'No reason provided')
    conversion.status = 'disputed'
    conversion.disputeReason = reason
    await conversion.save()

    return response.json({
      success: true,
      message: 'Conversion disputed',
      data: conversion.serialize(),
    })
  }

  /**
   * Get conversion statistics for a campaign
   */
  async getStats({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const { campaignId } = params

    const campaign = await Campaign.query()
      .where('id', campaignId)
      .where('vendor_id', user.id)
      .first()

    if (!campaign && user.role !== 'admin') {
      return response.status(404).json({ error: 'Campaign not found' })
    }

    const conversions = await VendorConversion.query().where('campaign_id', campaignId)

    const approved = conversions.filter((c) => c.status === 'approved')
    const pending = conversions.filter((c) => c.status === 'pending')
    const rejected = conversions.filter((c) => c.status === 'rejected')
    const reversed = conversions.filter((c) => c.status === 'reversed')
    const flagged = conversions.filter((c) => c.flaggedForReview)

    const totalApprovedAmount = approved.reduce((sum, c) => sum + c.amount, 0)
    const totalCommission = approved.reduce((sum, c) => sum + (c.commissionAmount || 0), 0)

    return response.json({
      success: true,
      data: {
        total: conversions.length,
        approved: approved.length,
        pending: pending.length,
        rejected: rejected.length,
        reversed: reversed.length,
        flaggedForReview: flagged.length,
        totalApprovedAmount,
        totalCommission,
        approvalRate: conversions.length > 0 ? ((approved.length / conversions.length) * 100).toFixed(2) : '0',
      },
    })
  }
}
