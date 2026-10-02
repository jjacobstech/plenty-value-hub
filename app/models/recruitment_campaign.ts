import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class RecruitmentCampaign extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare adminId: number

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare campaignType: 'mass_invite' | 'tier_promotion' | 'seasonal' | 'performance_based'

  @column()
  declare status: 'planning' | 'active' | 'paused' | 'completed'

  @column()
  declare targetAffiliates: number | null

  @column()
  declare recruitedCount: number

  @column()
  declare conversionTarget: number | null

  @column()
  declare bonusCommissionRate: number | null

  @column.dateTime()
  declare startedAt: DateTime | null

  @column.dateTime()
  declare endedAt: DateTime | null

  @column()
  declare totalBonusPaid: number

  @column()
  declare targetCriteria: Record<string, any> | null

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
