import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import CommissionDispute from '#models/commission_dispute'
import User from '#models/user'

export default class DisputeAssignment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare disputeId: number

  @column()
  declare assignedToUserId: number

  @column()
  declare assignedByUserId: number

  @column()
  declare assignmentNotes: string | null

  @column()
  declare isActive: boolean

  @column.dateTime()
  declare assignedAt: DateTime

  @column.dateTime()
  declare unassignedAt: DateTime | null

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => CommissionDispute)
  declare dispute: BelongsTo<typeof CommissionDispute>

  @belongsTo(() => User, { foreignKey: 'assignedToUserId' })
  declare assignedToUser: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'assignedByUserId' })
  declare assignedByUser: BelongsTo<typeof User>
}
