import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/orm'
import AffiliateLink from '#models/affiliate_link'
import Click from '#models/click'

export default class Conversion extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'conversion_id' })
  declare conversionId: string

  @column({ columnName: 'click_id' })
  declare clickId: number | null

  @column({ columnName: 'affiliate_link_id' })
  declare affiliateLinkId: number

  @column({ columnName: 'affiliate_id' })
  declare affiliateId: number

  @column({ columnName: 'campaign_id' })
  declare campaignId: number

  @column({ columnName: 'status' })
  declare status: 'pending' | 'approved' | 'rejected' | 'reversed'

  @column({ columnName: 'order_value' })
  declare orderValue: number | null

  @column({ columnName: 'commission_amount' })
  declare commissionAmount: number | null

  @column({ columnName: 'external_order_id' })
  declare externalOrderId: string | null

  @column({ columnName: 'external_conversion_id' })
  declare externalConversionId: string | null

  @column({ columnName: 'rejection_reason' })
  declare rejectionReason: string | null

  @column.dateTime({ columnName: 'converted_at' })
  declare convertedAt: DateTime

  @column.dateTime({ columnName: 'approved_at' })
  declare approvedAt: DateTime | null

  @column.dateTime({ columnName: 'rejected_at' })
  declare rejectedAt: DateTime | null

  @column.dateTime({ columnName: 'reversed_at' })
  declare reversedAt: DateTime | null

  @column({ columnName: 'approved_by_admin_id' })
  declare approvedByAdminId: number | null

  @column({ columnName: 'metadata' })
  declare metadata: any

  @column.dateTime({ columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at' })
  declare updatedAt: DateTime

  @belongsTo(() => AffiliateLink, { foreignKey: 'affiliateLinkId' })
  declare affiliateLink: BelongsTo<typeof AffiliateLink>

  @belongsTo(() => Click, { foreignKey: 'clickId' })
  declare click: BelongsTo<typeof Click>
}
