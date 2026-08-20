import { BaseModel, column, belongsTo, beforeSave } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import User from '#models/user'
import Wallet from '#models/wallet'
import crypto from 'node:crypto'

export default class PayoutRequest extends BaseModel {
  static table = 'payout_requests'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uuid: string

  @beforeSave()
  static async generateUuid(model: PayoutRequest) {
    if (!model.uuid) {
      model.uuid = crypto.randomUUID()
    }
  }

  @column()
  declare userId: number

  @column()
  declare walletId: number

  @column()
  declare amount: string

  @column()
  declare payoutMethod: string

  @column()
  declare payoutDetails: string

  @column()
  declare status: 'pending' | 'approved' | 'paid' | 'rejected'

  @column()
  declare adminNotes: string | null

  @column.dateTime()
  declare processedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Wallet, { foreignKey: 'walletId' })
  declare wallet: BelongsTo<typeof Wallet>
}
