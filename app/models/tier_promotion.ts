import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import AffiliateProfile from '#models/affiliate_profile'
import User from '#models/user'

export default class TierPromotion extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare affiliateId: number

  @column()
  declare fromTier: 'bronze' | 'silver' | 'gold' | 'platinum'

  @column()
  declare toTier: 'bronze' | 'silver' | 'gold' | 'platinum'

  @column()
  declare promotionReason: string | null

  @column()
  declare isAutomatic: boolean

  @column()
  declare isApproved: boolean

  @column()
  declare approvedByUserId: number | null

  @column.dateTime()
  declare approvedAt: DateTime | null

  @column()
  declare bonusCommission: number | null

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => AffiliateProfile)
  declare affiliate: BelongsTo<typeof AffiliateProfile>

  @belongsTo(() => User, { foreignKey: 'approvedByUserId' })
  declare approvedByUser: BelongsTo<typeof User>
}
