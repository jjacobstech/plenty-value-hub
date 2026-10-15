import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import OrganisationAffiliate from '#models/organisation_affiliate'

export default class OrganisationDashboardSession extends BaseModel {
  static table = 'organisation_dashboard_sessions'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'public_id' })
  declare publicId: string

  @column({ columnName: 'organisation_id' })
  declare organisationId: number

  @column()
  declare livemode: boolean

  @column({ columnName: 'affiliate_id' })
  declare affiliateId: number

  @column({ columnName: 'token_hash' })
  declare tokenHash: string

  @column.dateTime({ columnName: 'expires_at' })
  declare expiresAt: DateTime

  @column.dateTime({ columnName: 'redeemed_at' })
  declare redeemedAt: DateTime | null

  @column({ columnName: 'return_url' })
  declare returnUrl: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => OrganisationAffiliate, { foreignKey: 'affiliateId' })
  declare affiliate: BelongsTo<typeof OrganisationAffiliate>
}
