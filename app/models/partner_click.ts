import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class PartnerClick extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'public_id' })
  declare publicId: string

  @column({ columnName: 'partner_id' })
  declare partnerId: number

  @column()
  declare livemode: boolean

  @column({ columnName: 'link_id' })
  declare linkId: number

  @column({ columnName: 'affiliate_id' })
  declare affiliateId: number

  @column({ columnName: 'product_ref' })
  declare productRef: string | null

  @column({ columnName: 'campaign_ref' })
  declare campaignRef: string | null

  @column({ columnName: 'visitor_hash' })
  declare visitorHash: string

  @column({ columnName: 'is_unique' })
  declare isUnique: boolean

  @column()
  declare referrer: string | null

  @column({ prepare: (v: Record<string, string>) => JSON.stringify(v ?? {}) })
  declare utm: Record<string, string>

  @column({ columnName: 'user_agent_family' })
  declare userAgentFamily: string | null

  @column.dateTime({ columnName: 'clicked_at' })
  declare clickedAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
