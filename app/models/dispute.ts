import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import CommissionLedger from '#models/commission_ledger'
import User from '#models/user'
import DisputeActivity from '#models/dispute_activity'
import DisputeComment from '#models/dispute_comment'
import DisputeAssignment from '#models/dispute_assignment'

export default class Dispute extends BaseModel {
  static table = 'commission_disputes'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'commission_ledger_id' })
  declare commissionLedgerId: number

  @column({ columnName: 'user_id' })
  declare userId: number

  @column({ columnName: 'filed_by_user_id' })
  declare filedByUserId: number

  @column({ columnName: 'dispute_type' })
  declare type: 'amount_mismatch' | 'calculation_error' | 'missing_commission' | 'duplicate_entry' | 'payment_issue' | 'other' | 'commission' | 'chargeback' | 'conversion' | 'payout'

  @column({ columnName: 'status' })
  declare status: 'open' | 'escalated' | 'resolved' | 'closed'

  @column({ columnName: 'priority' })
  declare priority: 'low' | 'medium' | 'high' | 'critical'

  @column({ columnName: 'description' })
  declare description: string

  @column({ columnName: 'supporting_notes' })
  declare supportingNotes: string | null

  @column({ columnName: 'disputed_amount' })
  declare amount: number

  @column({ columnName: 'claimed_amount' })
  declare claimedAmount: number | null

  @column({ columnName: 'resolution_type' })
  declare resolutionType: 'rejection' | 'adjustment' | 'reversal' | 'manual_approval' | 'pending' | null

  @column({ columnName: 'resolved_amount' })
  declare resolvedAmount: number | null

  @column({ columnName: 'resolution_notes' })
  declare resolutionNotes: string | null

  @column({ columnName: 'resolved_by_user_id' })
  declare resolvedByUserId: number | null

  @column.dateTime({ columnName: 'resolved_at' })
  declare resolvedAt: DateTime | null

  @column.dateTime({ columnName: 'due_date' })
  declare dueDate: DateTime | null

  @column({ columnName: 'is_escalated' })
  declare isEscalated: boolean

  @column.dateTime({ columnName: 'escalated_at' })
  declare escalatedAt: DateTime | null

  @column({ columnName: 'escalated_to_user_id' })
  declare escalatedToUserId: number | null

  @column({ columnName: 'initiator_id' })
  declare initiatorId: number | null

  @column({ columnName: 'respondent_id' })
  declare respondentId: number | null

  @column({ columnName: 'related_conversion_id' })
  declare relatedConversionId: number | null

  @column({ columnName: 'reason' })
  declare reason: string | null

  @column({ columnName: 'evidence' })
  declare evidence: any[] | null

  @column({ columnName: 'escalation_reason' })
  declare escalationReason: string | null

  @column({ columnName: 'resolution' })
  declare resolution: 'approved' | 'rejected' | 'partial' | null

  @column({ columnName: 'amount_awarded' })
  declare amountAwarded: number | null

  @column({ columnName: 'admin_notes' })
  declare adminNotes: string | null

  @column({ columnName: 'metadata' })
  declare metadata: Record<string, any> | null

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => CommissionLedger, { foreignKey: 'commissionLedgerId' })
  declare commissionLedger: BelongsTo<typeof CommissionLedger>

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'filedByUserId' })
  declare filedByUser: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'resolvedByUserId' })
  declare resolvedByUser: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'initiatorId' })
  declare initiator: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'respondentId' })
  declare respondent: BelongsTo<typeof User>

  @hasMany(() => DisputeActivity, { foreignKey: 'disputeId' })
  declare activities: HasMany<typeof DisputeActivity>

  @hasMany(() => DisputeComment, { foreignKey: 'disputeId' })
  declare comments: HasMany<typeof DisputeComment>

  @hasMany(() => DisputeAssignment, { foreignKey: 'disputeId' })
  declare assignments: HasMany<typeof DisputeAssignment>
}
