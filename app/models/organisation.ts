import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import OrganisationApiKey from '#models/organisation_api_key'
import OrganisationProgram from '#models/organisation_program'
import OrganisationMember from '#models/organisation_member'

export default class Organisation extends BaseModel {
  static table = 'organisations'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'public_id' })
  declare publicId: string

  @column()
  declare name: string

  @column()
  declare status: 'active' | 'suspended'

  @column({ columnName: 'contact_email' })
  declare contactEmail: string

  @column({ columnName: 'allowed_redirect_domains', prepare: (v: string[]) => JSON.stringify(v) })
  declare allowedRedirectDomains: string[]

  @column({ columnName: 'click_id_param' })
  declare clickIdParam: string

  @column({ columnName: 'fallback_url' })
  declare fallbackUrl: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => OrganisationApiKey)
  declare apiKeys: HasMany<typeof OrganisationApiKey>

  @hasMany(() => OrganisationProgram)
  declare programs: HasMany<typeof OrganisationProgram>

  @hasMany(() => OrganisationMember)
  declare members: HasMany<typeof OrganisationMember>
}
