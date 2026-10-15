import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class OrganisationWebhookEvent extends BaseModel {
  static table = 'organisation_webhook_events'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'public_id' })
  declare publicId: string

  @column({ columnName: 'organisation_id' })
  declare organisationId: number

  @column()
  declare livemode: boolean

  @column()
  declare type: string

  @column({ prepare: (v: Record<string, unknown>) => JSON.stringify(v) })
  declare payload: Record<string, any>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
