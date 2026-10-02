import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class DisputeTemplate extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare adminId: number

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare disputeType: 'amount_mismatch' | 'calculation_error' | 'missing_commission' | 'duplicate_entry' | 'payment_issue' | 'other'

  @column()
  declare resolutionTemplate: string | null

  @column()
  declare metadata: Record<string, any> | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
