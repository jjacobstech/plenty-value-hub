import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, belongsTo } from '@adonisjs/lucid/orm'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/orm'
import Click from '#models/click'
import Conversion from '#models/conversion'
import Campaign from '#models/campaign'

export default class AffiliateLink extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare affiliateId: number

  @column()
  declare campaignId: number

  @column()
  declare slug: string

  @column()
  declare token: string

  @column()
  declare customAlias: string | null

  @column()
  declare description: string | null

  @column.dateTime()
  declare createdAt: DateTime

  @column.dateTime()
  declare updatedAt: DateTime

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column()
  declare totalClicks: number

  @column()
  declare totalConversions: number

  @column()
  declare totalEarnings: number

  @column()
  declare isActive: boolean

  @belongsTo(() => Campaign, { foreignKey: 'campaignId' })
  declare campaign: BelongsTo<typeof Campaign>

  @hasMany(() => Click, { foreignKey: 'affiliateLinkId' })
  declare clicks: HasMany<typeof Click>

  @hasMany(() => Conversion, { foreignKey: 'affiliateLinkId' })
  declare conversions: HasMany<typeof Conversion>
}
