import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import AffiliateProfile from '#models/affiliate_profile'
import AffiliateReferral from '#models/affiliate_referral'

export default class ReferralCode extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare affiliateId: number

  @column()
  declare code: string

  @column()
  declare description: string | null

  @column()
  declare maxUses: number | null

  @column()
  declare currentUses: number

  @column()
  declare commissionRateOverride: number | null

  @column()
  declare codeType: 'personal' | 'campaign' | 'seasonal' | 'promotional'

  @column()
  declare isActive: boolean

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column.dateTime()
  declare startedAt: DateTime

  @column()
  declare totalConversions: number

  @column()
  declare totalRevenue: number

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => AffiliateProfile)
  declare affiliate: BelongsTo<typeof AffiliateProfile>

  @hasMany(() => AffiliateReferral)
  declare referrals: HasMany<typeof AffiliateReferral>
}
