import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Campaign from '#models/campaign'
import AffiliateProfile from '#models/affiliate_profile'

export default class AffiliateCampaign extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare affiliateId: number

  @column()
  declare campaignId: number

  @column()
  declare status: 'joined' | 'active' | 'paused' | 'left'

  @column()
  declare clicks: number

  @column()
  declare conversions: number

  @column()
  declare conversionRate: number

  @column()
  declare earnings: number

  @column.dateTime()
  declare joinedAt: DateTime

  @column.dateTime()
  declare leftAt: DateTime | null

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Campaign)
  declare campaign: BelongsTo<typeof Campaign>

  @belongsTo(() => AffiliateProfile)
  declare affiliate: BelongsTo<typeof AffiliateProfile>
}
