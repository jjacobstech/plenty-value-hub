import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class AffiliateWallet extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare affiliateId: number

  @column()
  declare availableBalance: number

  @column()
  declare pendingBalance: number

  @column()
  declare totalEarned: number

  @column()
  declare totalPaid: number

  @column()
  declare minimumPayoutThreshold: number

  @column()
  declare currency: string

  @column.dateTime()
  declare lastPayoutAt: DateTime | null

  @column.dateTime()
  declare createdAt: DateTime

  @column.dateTime()
  declare updatedAt: DateTime
}
