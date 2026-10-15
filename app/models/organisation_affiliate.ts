import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Organisation from '#models/organisation'

export default class OrganisationAffiliate extends BaseModel {
  static table = 'organisation_affiliates'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'public_id' })
  declare publicId: string

  @column({ columnName: 'organisation_id' })
  declare organisationId: number

  @column()
  declare livemode: boolean

  @column({ columnName: 'external_user_id' })
  declare externalUserId: string

  @column()
  declare status: 'active' | 'suspended' | 'closed'

  @column()
  declare email: string | null

  @column({ columnName: 'display_name' })
  declare displayName: string | null

  @column({ prepare: (v: Record<string, string>) => JSON.stringify(v ?? {}) })
  declare metadata: Record<string, string>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Organisation)
  declare organisation: BelongsTo<typeof Organisation>
}
