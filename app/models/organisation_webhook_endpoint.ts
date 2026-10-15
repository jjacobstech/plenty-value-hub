import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Organisation from '#models/organisation'
import OrganisationWebhookDelivery from '#models/organisation_webhook_delivery'

export default class OrganisationWebhookEndpoint extends BaseModel {
  static table = 'organisation_webhook_endpoints'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'public_id' })
  declare publicId: string

  @column({ columnName: 'organisation_id' })
  declare organisationId: number

  @column()
  declare livemode: boolean

  @column()
  declare url: string

  @column({ columnName: 'secret_encrypted' })
  declare secretEncrypted: string

  @column({ columnName: 'previous_secret_encrypted' })
  declare previousSecretEncrypted: string | null

  @column.dateTime({ columnName: 'previous_secret_expires_at' })
  declare previousSecretExpiresAt: DateTime | null

  @column({ columnName: 'enabled_events', prepare: (v: string[]) => JSON.stringify(v) })
  declare enabledEvents: string[]

  @column()
  declare status: 'enabled' | 'disabled'

  @column()
  declare description: string | null

  @column.dateTime({ columnName: 'failing_since' })
  declare failingSince: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Organisation)
  declare organisation: BelongsTo<typeof Organisation>

  @hasMany(() => OrganisationWebhookDelivery, { foreignKey: 'endpointId' })
  declare deliveries: HasMany<typeof OrganisationWebhookDelivery>
}
