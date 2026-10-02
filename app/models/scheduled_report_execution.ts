import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ReportSchedule from '#models/report_schedule'
import ReportLog from '#models/report_log'

export default class ScheduledReportExecution extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare reportScheduleId: number

  @column()
  declare reportLogId: number | null

  @column()
  declare executionStatus: 'scheduled' | 'running' | 'completed' | 'failed' | 'skipped'

  @column.dateTime()
  declare scheduledFor: DateTime

  @column.dateTime()
  declare executedAt: DateTime | null

  @column()
  declare executionDurationMs: number | null

  @column()
  declare triggeredBy: string | null

  @column()
  declare executionContext: Record<string, any> | null

  @column()
  declare failureReason: string | null

  @column()
  declare retryAttempt: number

  @column.dateTime()
  declare retryAt: DateTime | null

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => ReportSchedule)
  declare reportSchedule: BelongsTo<typeof ReportSchedule>

  @belongsTo(() => ReportLog)
  declare reportLog: BelongsTo<typeof ReportLog>
}
