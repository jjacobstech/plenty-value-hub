import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import User from '#models/user'
import WalletTransaction from '#models/wallet_transaction'
import PayoutRequest from '#models/payout_request'

export default class Wallet extends BaseModel {
  static table = 'wallets'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare availableBalance: string

  @column()
  declare pendingBalance: string

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
