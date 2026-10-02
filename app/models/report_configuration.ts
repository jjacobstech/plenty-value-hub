import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import ReportSchedule from '#models/report_schedule'
import ReportLog from '#models/report_log'

export default class ReportConfiguration extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare reportType: 'conversion' | 'commission' | 'campaign' | 'affiliate' | 'fraud' | 'revenue' | 'custom'

  @column()
  declare format: 'pdf' | 'csv' | 'excel' | 'json'

  @column()
  declare filters: Record<string, any> | null

  @column()
  declare columns: string[] | null

  @column()
  declare aggregations: Record<string, any> | null

  @column()
  declare frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'

  @column()
  declare scheduleConfig: Record<string, any> | null

  @column()
  declare emailRecipients: string | null

  @column()
  declare includeCharts: boolean

  @column()
  declare includeSummary: boolean

  @column()
  declare includeTrends: boolean

  @column()
  declare isActive: boolean

  @column()
  declare isTemplate: boolean

  @column()
  declare templateName: string | null

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => ReportSchedule)
  declare schedules: HasMany<typeof ReportSchedule>

  @hasMany(() => ReportLog)
  declare reportLogs: HasMany<typeof ReportLog>
}
