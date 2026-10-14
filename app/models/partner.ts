import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import PartnerApiKey from '#models/partner_api_key'
import PartnerProgram from '#models/partner_program'
import PartnerMember from '#models/partner_member'

export default class Partner extends BaseModel {
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

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => PartnerApiKey)
  declare apiKeys: HasMany<typeof PartnerApiKey>

  @hasMany(() => PartnerProgram)
  declare programs: HasMany<typeof PartnerProgram>

  @hasMany(() => PartnerMember)
  declare members: HasMany<typeof PartnerMember>
}
