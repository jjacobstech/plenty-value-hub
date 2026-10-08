import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import AffiliateLink from '#models/affiliate_link'

export default class Click extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'click_id' })
  declare clickId: string

  @column({ columnName: 'affiliate_link_id' })
  declare affiliateLinkId: number

  @column({ columnName: 'affiliate_id' })
  declare affiliateId: number

  @column({ columnName: 'campaign_id' })
  declare campaignId: number

  @column({ columnName: 'user_agent' })
  declare userAgent: string | null

  @column({ columnName: 'ip_address' })
  declare ipAddress: string | null

  @column({ columnName: 'referrer' })
  declare referrer: string | null

  @column({ columnName: 'country_code' })
  declare countryCode: string | null

  @column({ columnName: 'device_type' })
  declare deviceType: string | null

  @column({ columnName: 'browser' })
  declare browser: string | null

  @column({ columnName: 'os' })
  declare os: string | null

  @column({ columnName: 'country' })
  declare country: string | null

  @column({ columnName: 'city' })
  declare city: string | null

  @column({ columnName: 'metadata' })
  declare metadata: any

  @column.dateTime({ columnName: 'clicked_at' })
  declare clickedAt: DateTime

  @column.dateTime({ columnName: 'created_at' })
  declare createdAt: DateTime

  @belongsTo(() => AffiliateLink, { foreignKey: 'affiliateLinkId' })
  declare affiliateLink: BelongsTo<typeof AffiliateLink>
}
