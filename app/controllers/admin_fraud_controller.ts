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

    const flaggedConversions = await FraudDetectionService.getFlaggedConversions('pending')
    const stats = {
      pendingReview: flaggedConversions.length,
      criticalRisk: flaggedConversions.filter((c) => (c as any).fraud_risk_level === 'critical').length,
      highRisk: flaggedConversions.filter((c) => (c as any).fraud_risk_level === 'high').length,
    }

    return inertia.render('admin/AdminFraudDetection', {
      user,
      stats,
      conversions: flaggedConversions,
    })
  }

  /**
   * Get flagged conversions with filters
   */
  async getFlagged({ request, response }: HttpContext) {
    const status = request.input('status', 'pending')
    const riskLevel = request.input('riskLevel')

    let query = FraudDetectionService.getFlaggedConversions(status)

    if (riskLevel) {
      query = query.where('fraud_risk_level', riskLevel)
    }

    const conversions = await query

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
      byRiskLevel: {
        critical: flagged.filter((c) => (c as any).fraud_risk_level === 'critical').length,
        high: flagged.filter((c) => (c as any).fraud_risk_level === 'high').length,
        medium: flagged.filter((c) => (c as any).fraud_risk_level === 'medium').length,
        low: flagged.filter((c) => (c as any).fraud_risk_level === 'low').length,
      },
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
