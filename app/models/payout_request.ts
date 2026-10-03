import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type User from './user.js'

export default class PayoutRequest extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare requestId: string

  @column()
  declare affiliateId: number

  @column()
  declare amount: number

  @column()
  declare status: 'pending' | 'approved' | 'processing' | 'completed' | 'failed' | 'cancelled'

  @column()
  declare paymentMethod: 'bank_transfer' | 'paypal' | 'stripe' | 'mobile_money' | 'crypto'

  @column()
  declare paymentMethodId: string | null

  @column()
  declare currency: string

  @column()
  declare platformFee: number

  @column()
  declare netAmount: number

  @column()
  declare referenceNumber: string | null

  @column()
  declare notes: string | null

  @column()
  declare rejectionReason: string | null

  @column.dateTime()
  declare approvedAt: DateTime | null

  @column.dateTime()
  declare processedAt: DateTime | null

  @column.dateTime()
  declare completedAt: DateTime | null

  @column.dateTime()
  declare failedAt: DateTime | null

  @column()
  declare approvedByAdminId: number | null

  @column()
  declare transferCode: string | null

  @column()
  declare transferReference: string | null

  @column()
  declare transferStatus: 'pending' | 'success' | 'failed' | 'reversed' | null

  @column()
  declare transferErrorMessage: string | null

  @column.dateTime()
  declare transferInitiatedAt: DateTime | null

  @column.dateTime()
  declare transferCompletedAt: DateTime | null

  @column()
  declare metadata: any

  @column.dateTime()
  declare createdAt: DateTime

  @column.dateTime()
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'affiliateId' })
  declare user: User

  @belongsTo(() => User, { foreignKey: 'approvedByAdminId' })
  declare approvedByAdmin: User | null
}
