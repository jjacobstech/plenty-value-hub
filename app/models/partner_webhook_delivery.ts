import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import PartnerWebhookEndpoint from '#models/partner_webhook_endpoint'
import PartnerWebhookEvent from '#models/partner_webhook_event'

export default class PartnerWebhookDelivery extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

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

  @belongsTo(() => PartnerWebhookEvent, { foreignKey: 'webhookEventId' })
  declare event: BelongsTo<typeof PartnerWebhookEvent>

  @belongsTo(() => PartnerWebhookEndpoint, { foreignKey: 'endpointId' })
  declare endpoint: BelongsTo<typeof PartnerWebhookEndpoint>
}
