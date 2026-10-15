import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import OrganisationCommission from '#models/organisation_commission'
import OrganisationAffiliate from '#models/organisation_affiliate'
import OrganisationClick from '#models/organisation_click'
import OrganisationLink from '#models/organisation_link'

export default class OrganisationEvent extends BaseModel {
  static table = 'organisation_events'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'public_id' })
  declare publicId: string

  @column({ columnName: 'organisation_id' })
  declare organisationId: number

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

  @belongsTo(() => OrganisationClick, { foreignKey: 'clickId' })
  declare click: BelongsTo<typeof OrganisationClick>

  @belongsTo(() => OrganisationAffiliate, { foreignKey: 'affiliateId' })
  declare affiliate: BelongsTo<typeof OrganisationAffiliate>

  @belongsTo(() => OrganisationLink, { foreignKey: 'linkId' })
  declare link: BelongsTo<typeof OrganisationLink>

  @hasOne(() => OrganisationCommission, { foreignKey: 'eventId' })
  declare commission: HasOne<typeof OrganisationCommission>
}
