import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import CommissionLedger from '#models/commission_ledger'
import User from '#models/user'
import DisputeActivity from '#models/dispute_activity'
import DisputeComment from '#models/dispute_comment'
import DisputeAssignment from '#models/dispute_assignment'

export default class CommissionDispute extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare commissionLedgerId: number

  @column()
  declare userId: number

  @column()
  declare filedByUserId: number

  @column()
  declare disputeType: 'amount_mismatch' | 'calculation_error' | 'missing_commission' | 'duplicate_entry' | 'payment_issue' | 'other'

  @column()
  declare status: string

  @column()
  declare priority: 'low' | 'medium' | 'high' | 'critical'

  @column()
  declare description: string

  @column()
  declare supportingNotes: string | null

  @column()
  declare disputedAmount: number

  @column()
  declare claimedAmount: number | null

  @column()
  declare resolutionType: 'rejection' | 'adjustment' | 'reversal' | 'manual_approval' | 'pending'

  @column()
  declare resolvedAmount: number | null

  @column()
  declare resolutionNotes: string | null

  @column()
  declare resolvedByUserId: number | null

  @column.dateTime()
  declare resolvedAt: DateTime | null

  @column.dateTime()
  declare dueDate: DateTime | null

  @column()
  declare isEscalated: boolean

  @column.dateTime()
  declare escalatedAt: DateTime | null

  @column()
  declare escalatedToUserId: number | null

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => CommissionLedger)
  declare commissionLedger: BelongsTo<typeof CommissionLedger>

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'filedByUserId' })
  declare filedByUser: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'resolvedByUserId' })
  declare resolvedByUser: BelongsTo<typeof User>

  @hasMany(() => DisputeActivity)
  declare activities: HasMany<typeof DisputeActivity>

  @hasMany(() => DisputeComment)
  declare comments: HasMany<typeof DisputeComment>

  @hasMany(() => DisputeAssignment)
  declare assignments: HasMany<typeof DisputeAssignment>
}
