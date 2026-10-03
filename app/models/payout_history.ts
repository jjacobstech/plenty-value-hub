import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class PayoutHistory extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare payoutRequestId: number

  @column()
  declare affiliateId: number

  @column()
  declare event: 'created' | 'approved' | 'processing' | 'completed' | 'failed' | 'cancelled'

  @column()
  declare status: string

  @column()
  declare notes: string | null

  @column()
  declare createdByUserId: number | null

  @column()
  declare metadata: any

  @column.dateTime()
  declare createdAt: DateTime
}
