import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class DisputeStatistics extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number | null

  @column()
  declare totalDisputes: number

  @column()
  declare openDisputes: number

  @column()
  declare resolvedDisputes: number

  @column()
  declare escalatedDisputes: number

  @column()
  declare totalDisputedAmount: number

  @column()
  declare totalResolvedAmount: number

  @column()
  declare averageResolutionTimeDays: number

  @column()
  declare disputesByType: Record<string, any> | null

  @column()
  declare disputesByStatus: Record<string, any> | null

  @column.dateTime()
  declare lastUpdatedAt: DateTime | null

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
