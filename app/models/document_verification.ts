import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import KycSubmission from '#models/kyc_submission'

export default class DocumentVerification extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare kycSubmissionId: number

  @column()
  declare documentType: 'proof_of_identity' | 'proof_of_address' | 'business_license' | 'tax_certificate' | 'beneficial_owner' | 'bank_statement'

  @column()
  declare documentUrl: string

  @column()
  declare fileName: string

  @column()
  declare fileSize: number

  @column()
  declare mimeType: string

  @column()
  declare verificationStatus: 'pending' | 'verified' | 'rejected' | 'unclear'

  @column()
  declare ocrExtractedData: string | null

  @column()
  declare matchScore: number

  @column()
  declare expiryDateExtracted: DateTime | null

  @column()
  declare documentNumberExtracted: string | null

  @column()
  declare issueCountry: string | null

  @column()
  declare manualReviewRequired: boolean

  @column()
  declare rejectionReason: string | null

  @column()
  declare verifierNotes: string | null

  @column()
  declare verifiedBy: number | null

  @column.dateTime()
  declare verifiedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => KycSubmission)
  declare kycSubmission: BelongsTo<typeof KycSubmission>
}
