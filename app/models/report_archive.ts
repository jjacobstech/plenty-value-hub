import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ReportLog from '#models/report_log'

export default class ReportArchive extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare reportLogId: number

  @column()
  declare archiveLocation: string

  @column()
  declare archiveFormat: string | null

  @column()
  declare originalFileSize: number | null

  @column()
  declare compressedFileSize: number | null

  @column()
  declare compressionRatio: number | null

  @column.dateTime()
  declare archivedAt: DateTime

  @column.dateTime()
  declare retentionUntil: DateTime | null

  @column()
  declare isRetrievable: boolean

  @column()
  declare archiveMetadata: Record<string, any> | null

  @column()
  declare storageType: string | null

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => ReportLog)
  declare reportLog: BelongsTo<typeof ReportLog>
}
