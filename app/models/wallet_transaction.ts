import { BaseModel, column, belongsTo, beforeSave } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Wallet from '#models/wallet'
import crypto from 'node:crypto'

export default class WalletTransaction extends BaseModel {
  static table = 'wallet_transactions'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uuid: string

  @beforeSave()
  static async generateUuid(model: WalletTransaction) {
    if (!model.uuid) {
      model.uuid = crypto.randomUUID()
    }
  }

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
