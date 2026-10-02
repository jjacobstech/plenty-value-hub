import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class RecruitmentMetric extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare affiliateId: number | null

  @column()
  declare campaignId: number | null

  @column()
  declare totalRecruited: number

  @column()
  declare activeRecruited: number

  @column()
  declare inactiveRecruited: number

  @column()
  declare totalReferralEarnings: number

  @column()
  declare averageReferralEarnings: number

  @column()
  declare conversionRate: number

  @column()
  declare topPerformerCount: number

  @column()
  declare retentionRate: number

  @column.dateTime()
  declare lastCalculatedAt: DateTime | null

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
