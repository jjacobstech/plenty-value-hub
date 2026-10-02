import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import AffiliateProfile from '#models/affiliate_profile'

export default class AffiliatePerformanceHistory extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare affiliateId: number

  @column()
  declare metricType: 'earnings' | 'conversions' | 'referrals' | 'tier_change'

  @column()
  declare value: number

  @column()
  declare period: string

  @column()
  declare breakdown: Record<string, any> | null

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => AffiliateProfile)
  declare affiliate: BelongsTo<typeof AffiliateProfile>
}
