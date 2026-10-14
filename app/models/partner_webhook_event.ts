import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class PartnerWebhookEvent extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'public_id' })
  declare publicId: string

  @column({ columnName: 'partner_id' })
  declare partnerId: number

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
