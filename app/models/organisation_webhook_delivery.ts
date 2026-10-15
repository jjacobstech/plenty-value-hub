import { DateTime } from 'luxon'
import { publicId } from '#services/organisation/public_id'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import OrganisationWebhookEndpoint from '#models/organisation_webhook_endpoint'
import OrganisationWebhookEvent from '#models/organisation_webhook_event'

export default class OrganisationWebhookDelivery extends BaseModel {
  static table = 'organisation_webhook_deliveries'

  /** Every row gets a public id, so no code path can leave it empty. */
  @beforeCreate()
  static assignPublicId(row: OrganisationWebhookDelivery) {
    row.publicId ??= publicId('whd_')
  }

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'public_id' })
  declare publicId: string

  @column({ columnName: 'webhook_event_id' })
  declare webhookEventId: number

  @column({ columnName: 'endpoint_id' })
  declare endpointId: number

  @column()
  declare attempt: number

  @column()
  declare status: 'pending' | 'succeeded' | 'failed'

  @column.dateTime({ columnName: 'next_attempt_at' })
  declare nextAttemptAt: DateTime | null

  @column({ columnName: 'response_status' })
  declare responseStatus: number | null

  @column({ columnName: 'response_body_excerpt' })
  declare responseBodyExcerpt: string | null

  @column({ columnName: 'duration_ms' })
  declare durationMs: number | null

  @column.dateTime({ columnName: 'delivered_at' })
  declare deliveredAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => OrganisationWebhookEvent, { foreignKey: 'webhookEventId' })
  declare event: BelongsTo<typeof OrganisationWebhookEvent>

  @belongsTo(() => OrganisationWebhookEndpoint, { foreignKey: 'endpointId' })
  declare endpoint: BelongsTo<typeof OrganisationWebhookEndpoint>
}
