import type { HttpContext } from '@adonisjs/core/http'
import FraudDetectionService from '#services/fraud_detection_service'

export default class AdminFraudController {
  /**
   * Get fraud dashboard overview
   */
  async index({ inertia, auth }: HttpContext) {
    const user = auth.use('web').user

    if (user?.role !== 'admin') {
      return null
    }

    return inertia.render('admin/AdminFraudDetection', {})
  }

  /**
   * Get flagged conversions with filters
   */
  async getFlagged({ request, response }: HttpContext) {
    const status = request.input('status', 'pending')

    // The conversions table has no risk-level column, so there is no riskLevel filter to apply.
    const conversions = await FraudDetectionService.getFlaggedConversions(status)

    return response.json({
      success: true,
      data: conversions,
    })
  }

  /**
   * Approve flagged conversion
   */
  async approveConversion({ params, response }: HttpContext) {
    const conversion = await FraudDetectionService.approveConversion(params.id)

    return response.json({
      success: true,
      data: conversion,
      message: 'Conversion approved',
    })
  }

  /**
   * Reject flagged conversion
   */
  async rejectConversion({ params, request, response }: HttpContext) {
    const reason = request.input('reason', 'Suspected fraud')
    const conversion = await FraudDetectionService.rejectConversion(params.id, reason)

    return response.json({
      success: true,
      data: conversion,
      message: 'Conversion rejected',
    })
  }

  /**
   * Get fraud statistics
   */
  async getStats({ response }: HttpContext) {
    const flagged = await FraudDetectionService.getFlaggedConversions()

    const stats = {
      totalFlagged: flagged.length,
      flaggedValue: flagged.reduce((sum, c) => sum + (c.orderValue || 0), 0),
    }

    return response.json({
      success: true,
      data: stats,
    })
  }

  /**
   * Analyze specific conversion
   */
  async analyzeConversion({ params, response }: HttpContext) {
    const flags = await FraudDetectionService.analyzeConversion(params.id)

    return response.json({
      success: true,
      data: {
        conversionId: params.id,
        flags,
        riskLevel:
          flags.length === 0
            ? 'low'
            : flags.some((f) => f.riskLevel === 'critical')
              ? 'critical'
              : flags.some((f) => f.riskLevel === 'high')
                ? 'high'
                : 'medium',
      },
    })
  }
}
