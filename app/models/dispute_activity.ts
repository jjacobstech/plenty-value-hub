import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import CommissionDispute from '#models/commission_dispute'
import User from '#models/user'

export default class DisputeActivity extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare disputeId: number

  @column()
  declare userId: number

  @column()
  declare activityType: 'created' | 'status_changed' | 'comment_added' | 'amount_updated' | 'assigned' | 'escalated' | 'resolved'

  @column()
  declare oldValue: string | null

  @column()
  declare newValue: string | null

  @column()
  declare description: string | null

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => CommissionDispute)
  declare dispute: BelongsTo<typeof CommissionDispute>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
