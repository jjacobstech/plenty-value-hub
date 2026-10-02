import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import CommissionDispute from '#models/commission_dispute'
import User from '#models/user'

export default class DisputeApproval extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare disputeId: number

  @column()
  declare requestedByUserId: number

  @column()
  declare approvedByUserId: number | null

  @column()
  declare approvalStatus: 'pending' | 'approved' | 'rejected'

  @column()
  declare approvalReason: string | null

  @column()
  declare rejectionReason: string | null

  @column.dateTime()
  declare approvedAt: DateTime | null

  @column.dateTime()
  declare rejectedAt: DateTime | null

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => CommissionDispute)
  declare dispute: BelongsTo<typeof CommissionDispute>

  @belongsTo(() => User, { foreignKey: 'requestedByUserId' })
  declare requestedByUser: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'approvedByUserId' })
  declare approvedByUser: BelongsTo<typeof User>
}
