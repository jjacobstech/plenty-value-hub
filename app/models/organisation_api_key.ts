import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Organisation from '#models/organisation'

export default class OrganisationApiKey extends BaseModel {
  static table = 'organisation_api_keys'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'public_id' })
  declare publicId: string

  @column({ columnName: 'organisation_id' })
  declare organisationId: number

  @column()
  declare livemode: boolean

  @column()
  declare name: string

  @column({ columnName: 'key_hash' })
  declare keyHash: string

  @column()
  declare prefix: string

  @column({ columnName: 'last4' })
  declare last4: string

  @column.dateTime({ columnName: 'last_used_at' })
  declare lastUsedAt: DateTime | null

  @column.dateTime({ columnName: 'revoked_at' })
  declare revokedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Organisation)
  declare organisation: BelongsTo<typeof Organisation>
}
