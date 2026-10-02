import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import AffiliateProfile from '#models/affiliate_profile'

export default class AffiliateReward extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare affiliateId: number

  @column()
  declare rewardType: 'performance_bonus' | 'referral_bonus' | 'achievement' | 'milestone' | 'promotional'

  @column()
  declare rewardName: string

  @column()
  declare description: string | null

  @column()
  declare rewardAmount: number

  @column()
  declare status: 'pending' | 'awarded' | 'claimed' | 'expired'

  @column.dateTime()
  declare earnedAt: DateTime

  @column.dateTime()
  declare awardedAt: DateTime | null

  @column.dateTime()
  declare claimedAt: DateTime | null

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column()
  declare earningCriteria: string | null

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => AffiliateProfile)
  declare affiliate: BelongsTo<typeof AffiliateProfile>
}
