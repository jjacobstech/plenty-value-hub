import { BaseModel, column, belongsTo, beforeSave } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import crypto from 'node:crypto'
import User from '#models/user'
import Order from '#models/order'
import PayoutRequest from '#models/payout_request'
import Product from '#models/product'

export type TransactionType =
  | 'purchase'
  | 'sale'
  | 'payout'
  | 'commission'
  | 'refund'
  | 'transfer'
  | 'deposit'
  | 'adjustment'

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'processing'

export default class Transaction extends BaseModel {
  static table = 'transactions'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uuid: string

  @beforeSave()
  static async generateUuid(model: Transaction) {
    if (!model.uuid) {
      model.uuid = crypto.randomUUID()
    }
  }

  @column({ columnName: 'transaction_reference' })
  declare transactionReference: string

  @column({ columnName: 'user_id' })
  declare userId: number | null

  @column({ columnName: 'wallet_id' })
  declare walletId: number

  @column()
  declare type: TransactionType

  @column()
  declare category: string

  @column()
  declare status: TransactionStatus

  @column()
  declare amount: number

  @column()
  declare currency: string

  @column({ columnName: 'payment_method' })
  declare paymentMethod: string | null

  @column({ columnName: 'payment_gateway_reference' })
  declare paymentGatewayReference: string | null

  @column({ columnName: 'order_id' })
  declare orderId: number | null

  @column({ columnName: 'payout_request_id' })
  declare payoutRequestId: number | null

  @column({ columnName: 'product_id' })
  declare productId: number | null

  @column()
  declare description: string | null

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Order, { foreignKey: 'orderId' })
  declare order: BelongsTo<typeof Order>

  @belongsTo(() => PayoutRequest, { foreignKey: 'payoutRequestId' })
  declare payoutRequest: BelongsTo<typeof PayoutRequest>

  @belongsTo(() => Product, { foreignKey: 'productId' })
  declare product: BelongsTo<typeof Product>
}
