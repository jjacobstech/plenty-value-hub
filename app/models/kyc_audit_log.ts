import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class KycAuditLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare kycSubmissionId: number | null

  @column()
  declare userId: number

  @column()
  declare action: 'submission_created' | 'document_uploaded' | 'verification_started' | 'verification_completed' | 'risk_assessment_completed' | 'compliance_check_passed' | 'compliance_check_failed' | 'status_changed' | 'approval_granted' | 'rejection_issued' | 'manual_review_requested' | 'appeal_submitted'

  @column()
  declare actionType: 'kyc_submission' | 'document_verification' | 'risk_assessment' | 'compliance_check' | 'workflow'

  @column()
  declare entityType: 'kyc_submission' | 'document' | 'risk_assessment' | 'compliance_check'

  @column()
  declare entityId: number

  @column()
  declare previousStatus: string | null

  @column()
  declare newStatus: string

  @column()
  declare performedBy: number | null

  @column()
  declare performedByRole: string

  @column()
  declare ipAddress: string | null

  @column()
  declare userAgent: string | null

  @column()
  declare description: string

  @column()
  declare metadata: string | null

  @column()
  declare result: 'success' | 'failure' | 'pending'

  @column()
  declare duration: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
