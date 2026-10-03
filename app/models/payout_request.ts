import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type User from './user.js'

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
  declare status: 'pending' | 'approved' | 'paid' | 'rejected'

  @column({ columnName: 'admin_notes' })
  declare adminNotes: string | null

  @column.dateTime({ columnName: 'processed_at' })
  declare processedAt: DateTime | null

  @column.dateTime({ columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at' })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: User
}
