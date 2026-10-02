import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class AffiliateTier extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare tierLevel: 'bronze' | 'silver' | 'gold' | 'platinum'

  @column()
  declare monthlyEarningThreshold: number

  @column()
  declare minimumActiveReferrals: number

  @column()
  declare conversionRateMinimum: number

  @column()
  declare commissionRateBonus: number

  @column()
  declare benefits: Record<string, any> | null

  @column()
  declare requirements: Record<string, any> | null

  @column()
  declare description: string | null

  @column()
  declare isActive: boolean

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
