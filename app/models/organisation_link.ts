import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Organisation from '#models/organisation'
import OrganisationAffiliate from '#models/organisation_affiliate'

export default class OrganisationLink extends BaseModel {
  static table = 'organisation_links'

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

  @belongsTo(() => Organisation)
  declare organisation: BelongsTo<typeof Organisation>

  @belongsTo(() => OrganisationAffiliate, { foreignKey: 'affiliateId' })
  declare affiliate: BelongsTo<typeof OrganisationAffiliate>
}
