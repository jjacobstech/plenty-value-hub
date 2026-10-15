import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class OrganisationIdempotencyKey extends BaseModel {
  static table = 'organisation_idempotency_keys'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'organisation_id' })
  declare organisationId: number

  @column()
  declare livemode: boolean

  @column()
  declare key: string

  @column({ columnName: 'request_method' })
  declare requestMethod: string

  @column({ columnName: 'request_path' })
  declare requestPath: string

  @column({ columnName: 'request_hash' })
  declare requestHash: string

  @column({ columnName: 'response_status' })
  declare responseStatus: number | null

  @column({ columnName: 'response_body' })
  declare responseBody: unknown

  @column.dateTime({ columnName: 'locked_at' })
  declare lockedAt: DateTime | null

  @column.dateTime({ columnName: 'expires_at' })
  declare expiresAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
