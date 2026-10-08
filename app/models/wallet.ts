import { BaseModel, column, belongsTo, hasMany, beforeSave } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import User from '#models/user'
import WalletTransaction from '#models/wallet_transaction'
import PayoutRequest from '#models/payout_request'
import crypto from 'node:crypto'

export default class Wallet extends BaseModel {
  static table = 'wallets'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uuid: string

  @beforeSave()
  static async generateUuid(model: Wallet) {
    if (!model.uuid) {
      model.uuid = crypto.randomUUID()
    }
  }

  @column({ columnName: 'user_id' })
  declare userId: number

  @column({ columnName: 'available_balance' })
  declare availableBalance: number

  @column({ columnName: 'pending_balance' })
  declare pendingBalance: number

  @column()
  declare balance: number

  @column({ columnName: 'total_earnings' })
  declare totalEarnings: number

  @column({ columnName: 'total_withdrawn' })
  declare totalWithdrawn: number

  @column({ columnName: 'last_updated' })
  declare lastUpdated: DateTime | null

  @column()
  declare currency: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @hasMany(() => WalletTransaction, { foreignKey: 'walletId' })
  declare transactions: HasMany<typeof WalletTransaction>

  @hasMany(() => PayoutRequest, { foreignKey: 'walletId' })
  declare payoutRequests: HasMany<typeof PayoutRequest>
}
