import KycService from '#services/kyc_service'
import KycSubmission from '#models/kyc_submission'
import type { HttpContext } from '@adonisjs/core/http'

export default class KycController {
  /**
   * Create KYC submission
   * POST /api/kyc/submit
   */
  async createSubmission({ auth, request, response }: HttpContext) {
    const user = auth.use('web').user!

    const submission = await KycService.createSubmission({
      userId: user.id,
      submissionType: request.input('submission_type'),
      firstName: request.input('first_name'),
      lastName: request.input('last_name'),
      dateOfBirth: request.input('date_of_birth'),
      nationality: request.input('nationality'),
      businessName: request.input('business_name'),
      businessRegistration: request.input('business_registration'),
      documentType: request.input('document_type'),
      country: request.input('country'),
      state: request.input('state'),
      city: request.input('city'),
      zipCode: request.input('zip_code'),
      sourceOfFunds: request.input('source_of_funds'),
      expectedAnnualVolume: request.input('expected_annual_volume'),
    })

    return response.json({
      success: true,
      message: 'KYC submission created',
      data: submission.serialize(),
    })
  }

  /**
   * Upload KYC document
   * POST /api/kyc/:submissionId/documents
   */
  async uploadDocument({ params, auth, request, response }: HttpContext) {
    const user = auth.use('web').user!

    const submission = await KycSubmission.findOrFail(params.submissionId)
    if (submission.userId !== user.id && user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const document = await KycService.addDocument({
      kycSubmissionId: params.submissionId,
      documentType: request.input('document_type'),
      documentUrl: request.input('document_url'),
      fileName: request.input('file_name'),
      fileSize: request.input('file_size'),
      mimeType: request.input('mime_type'),
    })

    return response.json({
      success: true,
      message: 'Document uploaded',
      data: document.serialize(),
    })
  }

  /**
   * Verify document (admin)
   * POST /api/kyc/documents/:documentId/verify
   */
  async verifyDocument({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can verify documents' })
    }

    const document = await KycService.verifyDocument(params.documentId, user.id)

    return response.json({
      success: true,
      message: 'Document verified',
      data: document.serialize(),
    })
  }

  /**
   * Run risk assessment
   * POST /api/kyc/:submissionId/assess-risk
   */
  async assessRisk({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can perform risk assessment' })
    }

    const assessments = await KycService.assessRisk(params.submissionId)

    return response.json({
      success: true,
      message: 'Risk assessment completed',
      data: assessments.map((a) => a.serialize()),
    })
  }

  /**
   * Run compliance checks
   * POST /api/kyc/:submissionId/check-compliance
   */
  async checkCompliance({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can perform compliance checks' })
    }

    const checks = await KycService.checkCompliance(params.submissionId)

    return response.json({
      success: true,
      message: 'Compliance checks completed',
      data: checks.map((c) => c.serialize()),
    })
  }

  /**
   * Approve KYC submission
   * POST /api/kyc/:submissionId/approve
   */
  async approveSubmission({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can approve submissions' })
    }

    const submission = await KycService.approveSubmission(params.submissionId, user.id)

    return response.json({
      success: true,
      message: 'KYC submission approved',
      data: submission.serialize(),
    })
  }

  /**
   * Reject KYC submission
   * POST /api/kyc/:submissionId/reject
   */
  async rejectSubmission({ params, auth, request, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can reject submissions' })
    }

    const submission = await KycService.rejectSubmission(params.submissionId, request.input('rejection_reason'), user.id)

    return response.json({
      success: true,
      message: 'KYC submission rejected',
      data: submission.serialize(),
    })
  }

  /**
   * Get KYC submission details
   * GET /api/kyc/:submissionId
   */
  async getSubmission({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    const submission = await KycSubmission.findOrFail(params.submissionId)
    if (submission.userId !== user.id && user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const kycStatus = await KycService.getKycStatus(params.submissionId)

    return response.json({
      success: true,
      data: kycStatus,
    })
  }

  /**
   * Get audit trail
   * GET /api/kyc/:submissionId/audit-trail
   */
  async getAuditTrail({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    const submission = await KycSubmission.findOrFail(params.submissionId)
    if (submission.userId !== user.id && user.role !== 'admin') {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const auditLog = await KycService.getAuditTrail(params.submissionId)

    return response.json({
      success: true,
      data: auditLog.map((log) => log.serialize()),
    })
  }

  /**
   * List pending KYC submissions (admin)
   * GET /api/kyc/admin/pending
   */
  async listPendingSubmissions({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can view pending submissions' })
    }

    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const status = request.input('status', 'pending')

    const submissions = await KycSubmission.query()
      .where('status', status)
      .paginate(page, limit)

    return response.json({
      success: true,
      data: submissions.all().map((s) => s.serialize()),
      pagination: {
        total: submissions.total,
        perPage: submissions.perPage,
        currentPage: submissions.currentPage,
      },
    })
  }

  /**
   * Get KYC statistics (admin)
   * GET /api/kyc/admin/statistics
   */
  async getStatistics({ auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can view statistics' })
    }

    const totalSubmissions = await KycSubmission.query().count('* as total')
    const verified = await KycSubmission.query().where('status', 'verified').count('* as total')
    const rejected = await KycSubmission.query().where('status', 'rejected').count('* as total')
    const pending = await KycSubmission.query().where('status', 'pending').count('* as total')

    const riskDistribution = await KycSubmission.query()
      .select('risk_level')
      .count('* as count')
      .groupBy('risk_level')

    const total = (totalSubmissions[0] as any)?.total || 0
    const verifiedCount = (verified[0] as any)?.total || 0

    return response.json({
      success: true,
      data: {
        totalSubmissions: total,
        verified: verifiedCount,
        rejected: (rejected[0] as any)?.total || 0,
        pending: (pending[0] as any)?.total || 0,
        riskDistribution: riskDistribution.map((r) => ({
          level: (r as any).risk_level,
          count: (r as any).count,
        })),
        completionRate: total ? Math.round((verifiedCount / total) * 100) : 0,
      },
    })
  }

  /**
   * Search KYC submissions (admin)
   * GET /api/kyc/admin/search
   */
  async searchSubmissions({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (user.role !== 'admin') {
      return response.status(403).json({ error: 'Only admins can search' })
    }

    const query = request.input('q')
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const submissions = await KycSubmission.query()
      .where((q) => {
        q.whereILike('first_name', `%${query}%`)
          .orWhereILike('last_name', `%${query}%`)
          .orWhereILike('business_name', `%${query}%`)
          .orWhereILike('document_number', `%${query}%`)
      })
      .paginate(page, limit)

    return response.json({
      success: true,
      data: submissions.all().map((s) => s.serialize()),
      pagination: {
        total: submissions.total,
        perPage: submissions.perPage,
        currentPage: submissions.currentPage,
      },
    })
  }
}
