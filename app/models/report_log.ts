import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import ReportConfiguration from '#models/report_configuration'
import User from '#models/user'
import ReportExport from '#models/report_export'
import ReportArchive from '#models/report_archive'

export default class ReportLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare reportConfigurationId: number

  @column()
  declare userId: number

  @column()
  declare reportFileName: string | null

  @column()
  declare reportFilePath: string | null

  @column()
  declare reportFileUrl: string | null

  @column()
  declare fileSize: number | null

  @column()
  declare mimeType: string | null

  @column()
  declare status: 'pending' | 'processing' | 'completed' | 'failed' | 'archived'

  @column()
  declare formatGenerated: 'pdf' | 'csv' | 'excel' | 'json'

  @column()
  declare rowCount: number | null

  @column.dateTime()
  declare startDate: DateTime

  @column.dateTime()
  declare endDate: DateTime

  @column()
  declare filtersApplied: Record<string, any> | null

  @column()
  declare totalRows: number | null

  @column()
  declare totalValue: number | null

  @column()
  declare errorMessage: string | null

  @column()
  declare generationTimeMs: number | null

  @column()
  declare metadata: Record<string, any> | null

  @column()
  declare emailSentTo: string | null

  @column.dateTime()
  declare emailSentAt: DateTime | null

  @column()
  declare isArchived: boolean

  @column.dateTime()
  declare archivedAt: DateTime | null

  @column()
  declare archivedLocation: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => ReportConfiguration)
  declare reportConfiguration: BelongsTo<typeof ReportConfiguration>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasOne(() => ReportExport)
  declare export: HasOne<typeof ReportExport>

  @hasOne(() => ReportArchive)
  declare archive: HasOne<typeof ReportArchive>
}
