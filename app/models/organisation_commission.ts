import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import OrganisationAffiliate from '#models/organisation_affiliate'
import OrganisationEvent from '#models/organisation_event'

export default class OrganisationCommission extends BaseModel {
  static table = 'organisation_commissions'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'public_id' })
  declare publicId: string

  @column({ columnName: 'organisation_id' })
  declare organisationId: number

  @column()
  declare livemode: boolean

  @column({ columnName: 'event_id' })
  declare eventId: number

  @column({ columnName: 'affiliate_id' })
  declare affiliateId: number

  @column({ columnName: 'affiliate_external_user_id' })
  declare affiliateExternalUserId: string

  @column()
  declare amount: number

  @column()
  declare currency: string

  @column()
  declare status: 'pending' | 'approved' | 'rejected' | 'reversed'

  @column.dateTime({ columnName: 'hold_until' })
  declare holdUntil: DateTime

  @column.dateTime({ columnName: 'approved_at' })
  declare approvedAt: DateTime | null

  @column.dateTime({ columnName: 'rejected_at' })
  declare rejectedAt: DateTime | null

  @column.dateTime({ columnName: 'reversed_at' })
  declare reversedAt: DateTime | null

  @column.dateTime({ columnName: 'paid_at' })
  declare paidAt: DateTime | null

  @column({ columnName: 'payout_reference' })
  declare payoutReference: string | null

  @column()
  declare reason: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => OrganisationEvent, { foreignKey: 'eventId' })
  declare event: BelongsTo<typeof OrganisationEvent>

  @belongsTo(() => OrganisationAffiliate, { foreignKey: 'affiliateId' })
  declare affiliate: BelongsTo<typeof OrganisationAffiliate>
}
