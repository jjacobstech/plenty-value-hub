import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type User from './user.js'

export default class PayoutRequest extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'request_id' })
  declare requestId: string

  @column({ columnName: 'affiliate_id' })
  declare affiliateId: number

  @column()
  declare amount: number

  @column()
  declare status: 'pending' | 'approved' | 'processing' | 'completed' | 'failed' | 'cancelled'

  @column({ columnName: 'payment_method' })
  declare paymentMethod: 'bank_transfer' | 'paypal' | 'stripe' | 'mobile_money' | 'crypto'

  @column({ columnName: 'payment_method_id' })
  declare paymentMethodId: string | null

  @column()
  declare currency: string

  @column({ columnName: 'platform_fee' })
  declare platformFee: number

  @column({ columnName: 'net_amount' })
  declare netAmount: number

  @column({ columnName: 'reference_number' })
  declare referenceNumber: string | null

  @column()
  declare notes: string | null

  @column({ columnName: 'rejection_reason' })
  declare rejectionReason: string | null

  @column.dateTime({ columnName: 'approved_at' })
  declare approvedAt: DateTime | null

  @column.dateTime({ columnName: 'processed_at' })
  declare processedAt: DateTime | null

  @column.dateTime({ columnName: 'completed_at' })
  declare completedAt: DateTime | null

  @column.dateTime({ columnName: 'failed_at' })
  declare failedAt: DateTime | null

  @column({ columnName: 'approved_by_admin_id' })
  declare approvedByAdminId: number | null

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

  @column()
  declare metadata: any

  @column.dateTime({ columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at' })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'affiliateId' })
  declare user: User

  @belongsTo(() => User, { foreignKey: 'approvedByAdminId' })
  declare approvedByAdmin: User | null
}
