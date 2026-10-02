import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import ReferralCode from '#models/referral_code'
import AffiliateReferral from '#models/affiliate_referral'

export default class AffiliateProfile extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare affiliateTier: 'bronze' | 'silver' | 'gold' | 'platinum'

  @column()
  declare recruitmentSource: 'organic' | 'referral' | 'campaign' | 'admin_invited' | 'partnership'

  @column()
  declare bio: string | null

  @column()
  declare specializations: string[] | null

  @column()
  declare targetAudiences: string[] | null

  @column()
  declare averageConversionRate: number

  @column()
  declare totalReferrals: number

  @column()
  declare activeReferrals: number

  @column()
  declare totalEarnings: number

  @column()
  declare monthsActive: number

  @column()
  declare verificationScore: number

  @column()
  declare isVerified: boolean

  @column()
  declare isApproved: boolean

  @column()
  declare isSuspended: boolean

  @column()
  declare suspensionReason: string | null

  @column.dateTime()
  declare approvedAt: DateTime | null

  @column.dateTime()
  declare suspendedAt: DateTime | null

  @column.dateTime()
  declare verifiedAt: DateTime | null

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => ReferralCode)
  declare referralCodes: HasMany<typeof ReferralCode>

  @hasMany(() => AffiliateReferral)
  declare referrals: HasMany<typeof AffiliateReferral>
}
