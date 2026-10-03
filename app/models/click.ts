import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/orm'
import AffiliateLink from '#models/affiliate_link'

export default class Click extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare clickId: string

  @column()
  declare affiliateLinkId: number

  @column()
  declare affiliateId: number

  @column()
  declare campaignId: number

  @column()
  declare userAgent: string | null

  @column()
  declare ipAddress: string | null

  @column()
  declare referrer: string | null

  @column()
  declare deviceType: string | null

  @column()
  declare browser: string | null

  @column()
  declare os: string | null

  @column()
  declare country: string | null

  @column()
  declare city: string | null

  @column()
  declare metadata: any

  @column.dateTime()
  declare clickedAt: DateTime

  @column.dateTime()
  declare createdAt: DateTime

  @belongsTo(() => AffiliateLink, { foreignKey: 'affiliateLinkId' })
  declare affiliateLink: BelongsTo<typeof AffiliateLink>
}
