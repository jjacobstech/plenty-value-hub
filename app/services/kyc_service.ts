import KycSubmission from '#models/kyc_submission'
import DocumentVerification from '#models/document_verification'
import RiskAssessment from '#models/risk_assessment'
import ComplianceCheck from '#models/compliance_check'
import KycAuditLog from '#models/kyc_audit_log'
import { DateTime } from 'luxon'

export default class KycService {
  /**
   * Create KYC submission
   */
  static async createSubmission(data: {
    userId: number
    submissionType: 'individual' | 'business'
    firstName?: string
    lastName?: string
    dateOfBirth?: string
    nationality?: string
    businessName?: string
    businessRegistration?: string
    documentType?: string
    country?: string
    state?: string
    city?: string
    zipCode?: string
    sourceOfFunds?: string
    expectedAnnualVolume?: number
  }): Promise<KycSubmission> {
    const submission = await KycSubmission.create({
      userId: data.userId,
      submissionType: data.submissionType,
      status: 'pending',
      verificationLevel: 1,
      riskScore: 0,
      riskLevel: 'low',
      complianceStatus: 'requires_review',
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      dateOfBirth: data.dateOfBirth || null,
      nationality: data.nationality || null,
      businessName: data.businessName || null,
      businessRegistration: data.businessRegistration || null,
      documentType: (data.documentType as any) || null,
      country: data.country || null,
      state: data.state || null,
      city: data.city || null,
      zipCode: data.zipCode || null,
      source_of_funds: data.sourceOfFunds || null,
      expectedAnnualVolume: data.expectedAnnualVolume || null,
    })

    await this.logAudit(submission.id, data.userId, 'submission_created', 'kyc_submission', submission.id, null, 'pending', data.userId, 'user')

    return submission
  }

  /**
   * Add document verification
   */
  static async addDocument(data: {
    kycSubmissionId: number
    documentType: 'proof_of_identity' | 'proof_of_address' | 'business_license' | 'tax_certificate' | 'beneficial_owner' | 'bank_statement'
    documentUrl: string
    fileName: string
    fileSize: number
    mimeType: string
  }): Promise<DocumentVerification> {
    const submission = await KycSubmission.findOrFail(data.kycSubmissionId)

    const document = await DocumentVerification.create({
      kycSubmissionId: data.kycSubmissionId,
      documentType: data.documentType,
      documentUrl: data.documentUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      verificationStatus: 'pending',
      matchScore: 0,
    })

    await this.logAudit(submission.id, submission.userId, 'document_uploaded', 'document_verification', document.id, null, 'pending', submission.userId, 'user')

    return document
  }

  /**
   * Verify document (simulate OCR extraction)
   */
  static async verifyDocument(documentId: number, verifierId: number): Promise<DocumentVerification> {
    const document = await DocumentVerification.findOrFail(documentId)
    const submission = await KycSubmission.findOrFail(document.kycSubmissionId)

    // Simulate OCR extraction
    const ocrData = this.extractDocumentData(document)
    document.ocrExtractedData = JSON.stringify(ocrData)
    document.verificationStatus = 'verified'
    document.matchScore = 95
    document.verifiedBy = verifierId
    document.verifiedAt = DateTime.now()
    await document.save()

    await this.logAudit(submission.id, verifierId, 'verification_completed', 'document_verification', documentId, 'pending', 'verified', verifierId, 'admin')

    return document
  }

  /**
   * Perform risk assessment
   */
  static async assessRisk(kycSubmissionId: number): Promise<RiskAssessment[]> {
    const submission = await KycSubmission.findOrFail(kycSubmissionId)
    const assessments: RiskAssessment[] = []

    const assessmentTypes: Array<'pep_check' | 'sanctions_check' | 'aml_check' | 'business_check' | 'behavioral_check'> = ['pep_check', 'sanctions_check', 'aml_check', 'business_check', 'behavioral_check']

    let totalRiskScore = 0

    for (const type of assessmentTypes) {
      const assessment = await RiskAssessment.create({
        kycSubmissionId,
        assessmentType: type,
        riskScore: this.calculateRiskScore(submission, type),
        riskLevel: this.determineRiskLevel(this.calculateRiskScore(submission, type)),
        isMatch: this.checkIfMatch(submission, type),
        dataSource: 'internal_database',
      })

      totalRiskScore += assessment.riskScore
      assessments.push(assessment)

      await this.logAudit(submission.id, submission.userId, 'risk_assessment_completed', 'risk_assessment', assessment.id, null, assessment.riskLevel, submission.userId, 'system')
    }

    // Update submission with overall risk
    submission.riskScore = Math.round(totalRiskScore / assessmentTypes.length)
    submission.riskLevel = this.determineRiskLevel(submission.riskScore)
    await submission.save()

    return assessments
  }

  /**
   * Perform compliance checks
   */
  static async checkCompliance(kycSubmissionId: number): Promise<ComplianceCheck[]> {
    const submission = await KycSubmission.findOrFail(kycSubmissionId)
    const checks: ComplianceCheck[] = []

    const checkTypes: Array<'document_validity' | 'age_verification' | 'address_verification' | 'business_legitimacy' | 'beneficial_owner_check' | 'source_of_funds'> = [
      'document_validity',
      'age_verification',
      'address_verification',
      'business_legitimacy',
      'beneficial_owner_check',
      'source_of_funds',
    ]

    let allPassed = true

    for (const type of checkTypes) {
      const result = this.performComplianceCheck(submission, type)

      const check = await ComplianceCheck.create({
        kycSubmissionId,
        checkType: type,
        checkStatus: result.status,
        complianceResult: result.result,
        failureReason: result.failureReason || null,
        requiredEvidenceProvided: result.evidenceProvided,
      })

      if (result.status === 'failed') {
        allPassed = false
      }

      checks.push(check)

      await this.logAudit(submission.id, submission.userId, result.status === 'passed' ? 'compliance_check_passed' : 'compliance_check_failed', 'compliance_check', check.id, null, result.status, submission.userId, 'system')
    }

    // Update submission compliance status
    submission.complianceStatus = allPassed ? 'compliant' : 'non_compliant'
    await submission.save()

    return checks
  }

  /**
   * Approve KYC submission
   */
  static async approveSubmission(kycSubmissionId: number, approverId: number): Promise<KycSubmission> {
    const submission = await KycSubmission.findOrFail(kycSubmissionId)

    submission.status = 'verified'
    submission.verificationLevel = 3
    submission.verifiedAt = DateTime.now()
    submission.nextReviewDate = DateTime.now().plus({ years: 1 })
    submission.complianceStatus = 'compliant'
    await submission.save()

    await this.logAudit(submission.id, approverId, 'approval_granted', 'kyc_submission', submission.id, 'under_review', 'verified', approverId, 'admin')

    return submission
  }

  /**
   * Reject KYC submission
   */
  static async rejectSubmission(kycSubmissionId: number, rejectionReason: string, rejectorId: number): Promise<KycSubmission> {
    const submission = await KycSubmission.findOrFail(kycSubmissionId)

    submission.status = 'rejected'
    submission.rejectionReason = rejectionReason
    submission.complianceStatus = 'non_compliant'
    await submission.save()

    await this.logAudit(submission.id, rejectorId, 'rejection_issued', 'kyc_submission', submission.id, 'under_review', 'rejected', rejectorId, 'admin')

    return submission
  }

  /**
   * Get KYC status
   */
  static async getKycStatus(kycSubmissionId: number) {
    const submission = await KycSubmission.query()
      .where('id', kycSubmissionId)
      .preload('documents')
      .preload('riskAssessments')
      .firstOrFail()

    const compliances = await ComplianceCheck.query().where('kyc_submission_id', kycSubmissionId)

    return {
      submission,
      documents: submission.documents,
      riskAssessments: submission.riskAssessments,
      complianceChecks: compliances,
    }
  }

  /**
   * Get audit trail
   */
  static async getAuditTrail(kycSubmissionId: number) {
    return KycAuditLog.query()
      .where('kyc_submission_id', kycSubmissionId)
      .orderBy('created_at', 'desc')
  }

  /**
   * Extract document data (simulated OCR)
   */
  private static extractDocumentData(document: DocumentVerification) {
    return {
      documentType: document.documentType,
      extractedDate: DateTime.now().toISO(),
      confidence: 0.95,
      fields: {
        name: 'John Doe',
        dateOfBirth: '1990-01-15',
        expiryDate: DateTime.now().plus({ years: 5 }).toISO(),
        documentNumber: 'AB123456',
        issueCountry: 'US',
      },
    }
  }

  /**
   * Calculate risk score based on assessment type
   */
  private static calculateRiskScore(submission: KycSubmission, assessmentType: string): number {
    let score = 0

    switch (assessmentType) {
      case 'pep_check':
        score = submission.nationality === 'RU' ? 35 : 5
        break
      case 'sanctions_check':
        score = submission.country === 'IR' || submission.country === 'KP' ? 40 : 8
        break
      case 'aml_check':
        score = submission.expectedAnnualVolume && submission.expectedAnnualVolume > 1000000 ? 20 : 5
        break
      case 'business_check':
        score = submission.submissionType === 'business' ? 15 : 3
        break
      case 'behavioral_check':
        score = submission.source_of_funds === 'crypto' ? 25 : 5
        break
      default:
        score = 10
    }

    return Math.min(score, 100)
  }

  /**
   * Determine risk level from score
   */
  private static determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical'
    if (score >= 60) return 'high'
    if (score >= 40) return 'medium'
    return 'low'
  }

  /**
   * Check if assessment matches high-risk criteria
   */
  private static checkIfMatch(submission: KycSubmission, assessmentType: string): boolean {
    switch (assessmentType) {
      case 'pep_check':
        return ['RU', 'CN', 'VE'].includes(submission.nationality || '')
      case 'sanctions_check':
        return ['IR', 'KP', 'SY', 'CU'].includes(submission.country || '')
      case 'aml_check':
        return submission.source_of_funds === 'crypto'
      case 'business_check':
        return submission.submissionType === 'business' && !submission.businessRegistration
      default:
        return false
    }
  }

  /**
   * Perform compliance check
   */
  private static performComplianceCheck(submission: KycSubmission, checkType: string) {
    const result = {
      status: 'passed' as 'passed' | 'failed' | 'requires_review',
      result: '',
      failureReason: null as string | null,
      evidenceProvided: true,
    }

    switch (checkType) {
      case 'document_validity':
        result.result = 'Document is valid and not expired'
        result.status = 'passed'
        break
      case 'age_verification':
        if (submission.dateOfBirth) {
          const age = DateTime.now().diff(DateTime.fromISO(submission.dateOfBirth), 'years').years
          result.status = age >= 18 ? 'passed' : 'failed'
          result.result = `User age: ${Math.floor(age)} years`
          result.failureReason = age < 18 ? 'User is below minimum age requirement' : null
        }
        break
      case 'address_verification':
        result.status = submission.country && submission.city && submission.zipCode ? 'passed' : 'requires_review'
        result.result = 'Address information verified against database'
        break
      case 'business_legitimacy':
        result.status = submission.businessRegistration ? 'passed' : 'requires_review'
        result.result = 'Business registration verified'
        result.failureReason = submission.businessRegistration ? null : 'Business registration number not provided'
        break
      case 'beneficial_owner_check':
        result.status = submission.beneficiaryOwners ? 'passed' : 'requires_review'
        result.result = 'Beneficial owner information verified'
        break
      case 'source_of_funds':
        result.status = submission.source_of_funds && submission.source_of_funds !== 'suspicious' ? 'passed' : 'requires_review'
        result.result = `Source of funds: ${submission.source_of_funds || 'not specified'}`
        break
    }

    return result
  }

  /**
   * Log audit event
   */
  private static async logAudit(
    kycSubmissionId: number,
    userId: number,
    action: string,
    actionType: string,
    entityId: number,
    previousStatus: string | null,
    newStatus: string,
    performedBy: number,
    performedByRole: string
  ) {
    await KycAuditLog.create({
      kycSubmissionId,
      userId,
      action: action as any,
      actionType: actionType as any,
      entityType: 'kyc_submission',
      entityId,
      previousStatus,
      newStatus,
      performedBy,
      performedByRole,
      description: `${action} for KYC submission ${kycSubmissionId}`,
      result: 'success',
    })
  }
}
