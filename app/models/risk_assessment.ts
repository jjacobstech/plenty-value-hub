import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import KycSubmission from '#models/kyc_submission'

export default class RiskAssessment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare kycSubmissionId: number

  @column()
  declare assessmentType: 'pep_check' | 'sanctions_check' | 'aml_check' | 'business_check' | 'behavioral_check'

  @column()
  declare riskScore: number

  @column()
  declare riskLevel: 'low' | 'medium' | 'high' | 'critical'

  @column()
  declare isMatch: boolean

  @column()
  declare matchDetails: string | null

  @column()
  declare pepStatus: 'no_match' | 'potential_match' | 'confirmed_match' | null

  @column()
  declare sanctionedStatus: 'no_match' | 'potential_match' | 'confirmed_match' | null

  @column()
  declare amlStatus: 'clean' | 'warning' | 'flagged' | null

  @column()
  declare businessRiskFactors: string | null

  @column()
  declare behavioralIndicators: string | null

  @column()
  declare dataSource: string

  @column()
  declare externalCheckId: string | null

  @column()
  declare externalCheckResult: string | null

  @column()
  declare reviewRequired: boolean

  @column()
  declare reviewerNotes: string | null

  @column()
  declare reviewedBy: number | null

  @column.dateTime()
  declare reviewedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => KycSubmission)
  declare kycSubmission: BelongsTo<typeof KycSubmission>
}
