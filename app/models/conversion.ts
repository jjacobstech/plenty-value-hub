import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/orm'
import AffiliateLink from '#models/affiliate_link'
import Click from '#models/click'

export default class Conversion extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare conversionId: string

  @column()
  declare clickId: number | null

  @column()
  declare affiliateLinkId: number

  @column()
  declare affiliateId: number

  @column()
  declare campaignId: number

  @column()
  declare status: 'pending' | 'approved' | 'rejected' | 'reversed'

  @column()
  declare orderValue: number | null

  @column()
  declare commissionAmount: number | null

  @column()
  declare externalOrderId: string | null

  @column()
  declare externalConversionId: string | null

  @column()
  declare rejectionReason: string | null

  @column.dateTime()
  declare convertedAt: DateTime

  @column.dateTime()
  declare approvedAt: DateTime | null

  @column.dateTime()
  declare rejectedAt: DateTime | null

  @column.dateTime()
  declare reversedAt: DateTime | null

  @column()
  declare approvedByAdminId: number | null

  @column()
  declare metadata: any

  @column.dateTime()
  declare createdAt: DateTime

  @column.dateTime()
  declare updatedAt: DateTime

  @belongsTo(() => AffiliateLink, { foreignKey: 'affiliateLinkId' })
  declare affiliateLink: BelongsTo<typeof AffiliateLink>

  @belongsTo(() => Click, { foreignKey: 'clickId' })
  declare click: BelongsTo<typeof Click>
}
