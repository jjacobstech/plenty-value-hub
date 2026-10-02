import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import ReportConfiguration from '#models/report_configuration'
import ScheduledReportExecution from '#models/scheduled_report_execution'

export default class ReportSchedule extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare reportConfigurationId: number

  @column()
  declare cronExpression: string

  @column()
  declare scheduleType: 'cron' | 'interval' | 'manual'

  @column()
  declare intervalMinutes: number | null

  @column.dateTime()
  declare startDate: DateTime

  @column.dateTime()
  declare endDate: DateTime | null

  @column()
  declare maxOccurrences: number | null

  @column()
  declare occurrencesCount: number

  @column.dateTime()
  declare nextRunAt: DateTime | null

  @column.dateTime()
  declare lastRunAt: DateTime | null

  @column()
  declare isActive: boolean

  @column()
  declare isPaused: boolean

  @column()
  declare retryCount: number

  @column()
  declare maxRetries: number

  @column()
  declare lastErrorMessage: string | null

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => ReportConfiguration)
  declare reportConfiguration: BelongsTo<typeof ReportConfiguration>

  @hasMany(() => ScheduledReportExecution)
  declare executions: HasMany<typeof ScheduledReportExecution>
}
