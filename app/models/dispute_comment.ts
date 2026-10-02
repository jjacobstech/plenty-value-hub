import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import CommissionDispute from '#models/commission_dispute'
import User from '#models/user'

export default class DisputeComment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare disputeId: number

  @column()
  declare userId: number

  @column()
  declare comment: string

  @column()
  declare isInternal: boolean

  @column()
  declare attachments: string[] | null

  @column()
  declare parentCommentId: number | null

  @column()
  declare isEdited: boolean

  @column.dateTime()
  declare editedAt: DateTime | null

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => CommissionDispute)
  declare dispute: BelongsTo<typeof CommissionDispute>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
