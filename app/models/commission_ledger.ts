import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Conversion from '#models/conversion'
import AffiliateLink from '#models/affiliate_link'

export default class CommissionLedger extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare ledgerId: string

  @column()
  declare affiliateId: number

  @column()
  declare campaignId: number

  @column()
  declare conversionId: number

  @column()
  declare affiliateLinkId: number

  @column()
  declare status: 'pending' | 'approved' | 'paid' | 'rejected' | 'disputed'

  @column()
  declare orderValue: number

  @column()
  declare commissionType: 'percentage' | 'fixed_amount' | 'lead' | 'hybrid'

  @column()
  declare commissionRate: number | null

  @column()
  declare commissionAmount: number

  @column()
  declare currency: string

  @column()
  declare platformFeeAmount: number

  @column()
  declare netCommission: number

  @column()
  declare description: string | null

  @column()
  declare rejectionReason: string | null

  @column.dateTime()
  declare approvedAt: DateTime | null

  @column.dateTime()
  declare paidAt: DateTime | null

  @column.dateTime()
  declare rejectedAt: DateTime | null

  @column()
  declare approvedByAdminId: number | null

  @column()
  declare paidByAdminId: number | null

  @column()
  declare disputedByUserId: number | null

  @column.dateTime()
  declare disputedAt: DateTime | null

  @column()
  declare disputeReason: string | null

  @column()
  declare metadata: any

  @column.dateTime()
  declare createdAt: DateTime

  @column.dateTime()
  declare updatedAt: DateTime

  @belongsTo(() => Conversion, { foreignKey: 'conversionId' })
  declare conversion: BelongsTo<typeof Conversion>

  @belongsTo(() => AffiliateLink, { foreignKey: 'affiliateLinkId' })
  declare affiliateLink: BelongsTo<typeof AffiliateLink>
}
