import { DateTime } from 'luxon'
import { publicId } from '#services/organisation/public_id'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Organisation from '#models/organisation'
import User from '#models/user'

export default class OrganisationMember extends BaseModel {
  static table = 'organisation_members'

  /** Every row gets a public id, so no code path can leave it empty. */
  @beforeCreate()
  static assignPublicId(row: OrganisationMember) {
    row.publicId ??= publicId('mem_')
  }

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'public_id' })
  declare publicId: string

  @column({ columnName: 'organisation_id' })
  declare organisationId: number

  @column({ columnName: 'user_id' })
  declare userId: number

  @column()
  declare role: 'owner' | 'admin' | 'developer' | 'viewer'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Organisation)
  declare organisation: BelongsTo<typeof Organisation>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
