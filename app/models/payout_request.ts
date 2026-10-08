import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class PayoutRequest extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'user_id' })
  declare userId: number

  @column({ columnName: 'wallet_id' })
  declare walletId: number

  @column({ columnName: 'amount' })
  declare amount: number

  @column({ columnName: 'payout_method' })
  declare payoutMethod: string

  @column({ columnName: 'payout_details' })
  declare payoutDetails: string

  @column({ columnName: 'status' })
  declare status: 'pending' | 'approved' | 'paid' | 'rejected' | 'processing' | 'completed' | 'failed'

  @column({ columnName: 'admin_notes' })
  declare adminNotes: string | null

  @column({ columnName: 'processed_at' })
  declare processedAt: DateTime | null

  @column({ columnName: 'transfer_code' })
  declare transferCode: string | null

  @column({ columnName: 'transfer_reference' })
  declare transferReference: string | null

  @column({ columnName: 'transfer_status' })
  declare transferStatus: 'pending' | 'success' | 'failed' | 'reversed' | null

  @column({ columnName: 'transfer_error_message' })
  declare transferErrorMessage: string | null

  @column.dateTime({ columnName: 'transfer_initiated_at' })
  declare transferInitiatedAt: DateTime | null

  @column.dateTime({ columnName: 'transfer_completed_at' })
  declare transferCompletedAt: DateTime | null

  @column.dateTime({ columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at' })
  declare updatedAt: DateTime | null

  @column({ columnName: 'affiliate_id' })
  declare affiliateId: number | null

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>
}
