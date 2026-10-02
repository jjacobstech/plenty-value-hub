import VendorConversion from '#models/vendor_conversion'
import FraudDetectionService from '#services/fraud_detection_service'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class FraudAnalyticsController {
  /**
   * Get fraud statistics
   */
  async getStats({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (!['admin', 'vendor'].includes(user.role)) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const campaignId = request.input('campaign_id')
    const startDate = request.input('start_date')
    const endDate = request.input('end_date')

    let dateRange: { start: DateTime; end: DateTime } | undefined
    if (startDate && endDate) {
      dateRange = {
        start: DateTime.fromISO(startDate),
        end: DateTime.fromISO(endDate),
      }
    }

    const stats = await FraudDetectionService.getFraudStats(campaignId, dateRange)

    return response.json({
      success: true,
      data: stats,
    })
  }

  /**
   * List conversions flagged for fraud review
   */
  async listFlagged({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (!['admin', 'vendor'].includes(user.role)) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const campaignId = request.input('campaign_id')
    const riskLevel = request.input('risk_level')
    const reviewed = request.input('reviewed', false)

    let query = VendorConversion.query().where('is_fraud_flagged', true)

    if (user.role === 'vendor') {
      query = query.where('vendor_id', user.id)
    } else if (campaignId) {
      query = query.where('campaign_id', campaignId)
    }

    if (riskLevel) {
      query = query.where('fraud_risk_level', riskLevel)
    }

    if (reviewed === 'true') {
      query = query.whereNotNull('fraud_review_at')
    } else if (reviewed === 'false') {
      query = query.whereNull('fraud_review_at')
    }

    const conversions = await query
      .orderBy('fraud_score', 'desc')
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
   * Get detailed fraud analysis for a conversion
   */
  async getFraudDetails({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const conversion = await VendorConversion.findOrFail(params.id)

    if (user.role === 'vendor' && conversion.vendorId !== user.id) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const fraudFlags = conversion.fraudFlags ? JSON.parse(conversion.fraudFlags) : {}

    return response.json({
      success: true,
      data: {
        id: conversion.id,
        externalOrderId: conversion.externalOrderId,
        amount: conversion.amount,
        customerEmail: conversion.customerEmail,
        fraudScore: conversion.fraudScore,
        fraudRiskLevel: conversion.fraudRiskLevel,
        fraudFlags,
        ipAddress: conversion.ipAddress,
        deviceId: conversion.deviceId,
        status: conversion.status,
        reviewedAt: conversion.fraudReviewAt,
        reviewedBy: conversion.reviewedBy,
        reviewNotes: conversion.fraudReviewNotes,
        createdAt: conversion.createdAt,
      },
    })
  }

  /**
   * Review and approve fraud flag (override fraud detection)
   */
  async approveFraudFlag({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can review fraud flags' })
    }

    const conversion = await VendorConversion.findOrFail(params.id)
    const notes = request.input('notes', '')

    conversion.isFraudFlagged = false
    conversion.fraudReviewAt = DateTime.now()
    conversion.reviewedBy = user.id
    conversion.fraudReviewNotes = notes

    await conversion.save()

    return response.json({
      success: true,
      message: 'Fraud flag approved',
      data: conversion.serialize(),
    })
  }

  /**
   * Reject fraud flag (approve the conversion)
   */
  async rejectFraudFlag({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can review fraud flags' })
    }

    const conversion = await VendorConversion.findOrFail(params.id)
    const notes = request.input('notes', '')

    conversion.isFraudFlagged = false
    conversion.fraudReviewAt = DateTime.now()
    conversion.reviewedBy = user.id
    conversion.fraudReviewNotes = `APPROVED: ${notes}`

    await conversion.save()

    return response.json({
      success: true,
      message: 'Fraud flag rejected, conversion approved',
      data: conversion.serialize(),
    })
  }

  /**
   * Auto-reject high-risk conversions
   */
  async autoRejectHighRisk({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can perform this action' })
    }

    const riskLevel = request.input('risk_level', 'critical')
    const threshold = request.input('fraud_score_threshold', 70)

    const conversions = await VendorConversion.query()
      .where('fraud_risk_level', riskLevel)
      .where('fraud_score', '>=', threshold)
      .where('status', 'pending')

    let rejected = 0
    for (const conversion of conversions) {
      conversion.status = 'rejected'
      conversion.rejectionReason = `Auto-rejected: High fraud risk (${conversion.fraudScore} score)`
      conversion.fraudReviewAt = DateTime.now()
      conversion.reviewedBy = user.id
      await conversion.save()
      rejected++
    }

    return response.json({
      success: true,
      message: `Auto-rejected ${rejected} high-risk conversions`,
      data: { rejected, threshold, riskLevel },
    })
  }

  /**
   * Get fraud trends over time
   */
  async getTrends({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (!['admin', 'vendor'].includes(user.role)) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const campaignId = request.input('campaign_id')
    const daysBack = request.input('days', 30)

    const startDate = DateTime.now().minus({ days: daysBack })

    let query = VendorConversion.query()
      .where('created_at', '>=', startDate.toSQL())
      .select('*')

    if (user.role === 'vendor') {
      query = query.where('vendor_id', user.id)
    } else if (campaignId) {
      query = query.where('campaign_id', campaignId)
    }

    const conversions = await query

    // Group by day
    const trends: Record<string, any> = {}
    conversions.forEach((c) => {
      const day = c.createdAt.toISODate()
      if (day) {
        if (!trends[day]) {
          trends[day] = {
            total: 0,
            flagged: 0,
            byRiskLevel: { low: 0, medium: 0, high: 0, critical: 0 },
          }
        }
        trends[day].total++
        if (c.isFraudFlagged) trends[day].flagged++
        if (c.fraudRiskLevel) {
          trends[day].byRiskLevel[c.fraudRiskLevel]++
        }
      }
    })

    return response.json({
      success: true,
      data: trends,
    })
  }

  /**
   * Get top fraud flags
   */
  async getTopFlags({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (!['admin', 'vendor'].includes(user.role)) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const campaignId = request.input('campaign_id')
    const daysBack = request.input('days', 7)

    const startDate = DateTime.now().minus({ days: daysBack })

    let query = VendorConversion.query()
      .where('is_fraud_flagged', true)
      .where('created_at', '>=', startDate.toSQL())

    if (user.role === 'vendor') {
      query = query.where('vendor_id', user.id)
    } else if (campaignId) {
      query = query.where('campaign_id', campaignId)
    }

    const conversions = await query

    const flagCounts: Record<string, number> = {}
    conversions.forEach((c) => {
      if (c.fraudFlags) {
        const flags = typeof c.fraudFlags === 'string' ? JSON.parse(c.fraudFlags) : c.fraudFlags
        if (flags && flags.flags && Array.isArray(flags.flags)) {
          flags.flags.forEach((flag: string) => {
            if (flag) {
              flagCounts[flag] = (flagCounts[flag] || 0) + 1
            }
          })
        }
      }
    })

    const sorted = Object.entries(flagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([flag, count]) => ({ flag, count }))

    return response.json({
      success: true,
      data: sorted,
    })
  }
}
