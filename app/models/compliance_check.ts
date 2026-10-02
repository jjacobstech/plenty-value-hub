import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import KycSubmission from '#models/kyc_submission'

export default class ComplianceCheck extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare kycSubmissionId: number

  @column()
  declare checkType: 'document_validity' | 'age_verification' | 'address_verification' | 'business_legitimacy' | 'beneficial_owner_check' | 'source_of_funds'

  @column()
  declare checkStatus: 'pending' | 'passed' | 'failed' | 'requires_review'

  @column()
  declare complianceResult: string

  @column()
  declare failureReason: string | null

  @column()
  declare requiredEvidenceProvided: boolean

  @column()
  declare evidenceDetails: string | null

  @column()
  declare regulatory_requirement: string | null

  @column()
  declare threshold_value: number | null

  @column()
  declare actual_value: number | null

  @column()
  declare escalation_status: 'none' | 'pending' | 'escalated'

  @column()
  declare escalation_reason: string | null

  @column()
  declare approvedBy: number | null

  @column()
  declare remarks: string | null

  @column.dateTime()
  declare approvedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => KycSubmission)
  declare kycSubmission: BelongsTo<typeof KycSubmission>
}
