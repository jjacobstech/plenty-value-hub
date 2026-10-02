import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import DocumentVerification from '#models/document_verification'
import RiskAssessment from '#models/risk_assessment'

export default class KycSubmission extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare submissionType: 'individual' | 'business'

  @column()
  declare status: 'pending' | 'under_review' | 'verified' | 'rejected' | 'expired'

  @column()
  declare verificationLevel: 1 | 2 | 3

  @column()
  declare firstName: string | null

  @column()
  declare lastName: string | null

  @column()
  declare dateOfBirth: string | null

  @column()
  declare nationality: string | null

  @column()
  declare documentType: 'passport' | 'drivers_license' | 'national_id' | 'business_registration' | null

  @column()
  declare documentNumber: string | null

  @column()
  declare expiryDate: DateTime | null

  @column()
  declare businessName: string | null

  @column()
  declare businessRegistration: string | null

  @column()
  declare businessAddress: string | null

  @column()
  declare businessType: string | null

  @column()
  declare beneficiaryOwners: string | null

  @column()
  declare source_of_funds: string | null

  @column()
  declare expectedAnnualVolume: number | null

  @column()
  declare country: string | null

  @column()
  declare state: string | null

  @column()
  declare city: string | null

  @column()
  declare zipCode: string | null

  @column()
  declare riskScore: number

  @column()
  declare riskLevel: 'low' | 'medium' | 'high' | 'critical'

  @column()
  declare complianceStatus: 'compliant' | 'non_compliant' | 'requires_review'

  @column()
  declare rejectionReason: string | null

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare verifiedAt: DateTime | null

  @column.dateTime()
  declare nextReviewDate: DateTime | null

  @hasMany(() => DocumentVerification)
  declare documents: HasMany<typeof DocumentVerification>

  @hasMany(() => RiskAssessment)
  declare riskAssessments: HasMany<typeof RiskAssessment>
}
