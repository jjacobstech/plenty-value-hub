import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Partner from '#models/partner'
import PartnerWebhookDelivery from '#models/partner_webhook_delivery'

export default class PartnerWebhookEndpoint extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'public_id' })
  declare publicId: string

  @column({ columnName: 'partner_id' })
  declare partnerId: number

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

  @belongsTo(() => Partner)
  declare partner: BelongsTo<typeof Partner>

  @hasMany(() => PartnerWebhookDelivery, { foreignKey: 'endpointId' })
  declare deliveries: HasMany<typeof PartnerWebhookDelivery>
}
