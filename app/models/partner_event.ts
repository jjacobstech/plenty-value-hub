import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import PartnerAffiliate from '#models/partner_affiliate'
import PartnerClick from '#models/partner_click'
import PartnerLink from '#models/partner_link'

export default class PartnerEvent extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'public_id' })
  declare publicId: string

  @column({ columnName: 'partner_id' })
  declare partnerId: number

  @column()
  declare livemode: boolean

  @column({ columnName: 'external_event_id' })
  declare externalEventId: string

  @column()
  declare type: string

  @column({ columnName: 'click_id' })
  declare clickId: number | null

  @column({ columnName: 'affiliate_id' })
  declare affiliateId: number | null

  @column({ columnName: 'link_id' })
  declare linkId: number | null

  @column({ columnName: 'referred_external_user_id' })
  declare referredExternalUserId: string | null

  @column()
  declare amount: number | null

  @column()
  declare currency: string | null

  @column()
  declare status: 'attributed' | 'unattributed' | 'rejected' | 'reversed'

  @column()
  declare reason: string | null

  @column.dateTime({ columnName: 'occurred_at' })
  declare occurredAt: DateTime

  @column({ prepare: (v: Record<string, string>) => JSON.stringify(v ?? {}) })
  declare metadata: Record<string, string>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => PartnerClick, { foreignKey: 'clickId' })
  declare click: BelongsTo<typeof PartnerClick>

  @belongsTo(() => PartnerAffiliate, { foreignKey: 'affiliateId' })
  declare affiliate: BelongsTo<typeof PartnerAffiliate>

  @belongsTo(() => PartnerLink, { foreignKey: 'linkId' })
  declare link: BelongsTo<typeof PartnerLink>
}
