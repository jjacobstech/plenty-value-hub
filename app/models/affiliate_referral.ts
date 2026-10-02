import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import AffiliateProfile from '#models/affiliate_profile'
import ReferralCode from '#models/referral_code'
import User from '#models/user'

export default class AffiliateReferral extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare affiliateId: number

  @column()
  declare referredUserId: number

  @column()
  declare referralCodeId: number | null

  @column()
  declare referralStatus: 'pending' | 'active' | 'inactive' | 'converted'

  @column.dateTime()
  declare activatedAt: DateTime | null

  @column.dateTime()
  declare inactiveAt: DateTime | null

  @column()
  declare earnedCommission: number

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

  @belongsTo(() => User, { foreignKey: 'referredUserId' })
  declare referredUser: BelongsTo<typeof User>

  @belongsTo(() => ReferralCode)
  declare referralCode: BelongsTo<typeof ReferralCode>
}
