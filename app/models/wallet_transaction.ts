import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Wallet from '#models/wallet'

export default class WalletTransaction extends BaseModel {
  static table = 'wallet_transactions'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare walletId: number

  @column()
  declare type: 'credit' | 'debit'

  @column()
  declare category: string

  @column()
  declare amount: string

  @column()
  declare referenceType: string | null

  @column()
  declare referenceId: number | null

  @column()
  declare description: string | null

  @column()
  declare balanceAfter: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Wallet, { foreignKey: 'walletId' })
  declare wallet: BelongsTo<typeof Wallet>
}
