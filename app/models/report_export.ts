import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ReportLog from '#models/report_log'
import User from '#models/user'

export default class ReportExport extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare reportLogId: number

  @column()
  declare userId: number

  @column()
  declare exportType: 'manual' | 'scheduled' | 'bulk'

  @column()
  declare exportIdentifier: string

  @column()
  declare includeHeaders: boolean

  @column()
  declare exportColumns: string[] | null

  @column()
  declare totalRecords: number

  @column()
  declare exportedRecords: number

  @column()
  declare exportFileSize: number | null

  @column()
  declare s3Bucket: string | null

  @column()
  declare s3Key: string | null

  @column()
  declare expirationDays: string | null

  @column()
  declare isEncrypted: boolean

  @column()
  declare encryptionKey: string | null

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => ReportLog)
  declare reportLog: BelongsTo<typeof ReportLog>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
