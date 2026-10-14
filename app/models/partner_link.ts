import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Partner from '#models/partner'
import PartnerAffiliate from '#models/partner_affiliate'

export default class PartnerLink extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'public_id' })
  declare publicId: string

  @column({ columnName: 'partner_id' })
  declare partnerId: number

  @column()
  declare livemode: boolean

  @column({ columnName: 'affiliate_id' })
  declare affiliateId: number

  @column()
  declare code: string

  @column({ columnName: 'product_ref' })
  declare productRef: string | null

  @column({ columnName: 'campaign_ref' })
  declare campaignRef: string | null

  @column({ columnName: 'destination_url' })
  declare destinationUrl: string

  @column()
  declare status: 'active' | 'disabled'

  @column({ prepare: (v: Record<string, string>) => JSON.stringify(v ?? {}) })
  declare metadata: Record<string, string>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Partner)
  declare partner: BelongsTo<typeof Partner>

  @belongsTo(() => PartnerAffiliate, { foreignKey: 'affiliateId' })
  declare affiliate: BelongsTo<typeof PartnerAffiliate>
}
