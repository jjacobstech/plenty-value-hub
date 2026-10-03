import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class PayoutMethod extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare affiliateId: number

  @column()
  declare methodId: string

  @column()
  declare methodType: 'bank_transfer' | 'paypal' | 'stripe' | 'mobile_money' | 'crypto'

  @column()
  declare accountHolderName: string

  @column()
  declare accountNumber: string | null

  @column()
  declare bankCode: string | null

  @column()
  declare bankName: string | null

  @column()
  declare countryCode: string | null

  @column()
  declare email: string | null

  @column()
  declare phoneNumber: string | null

  @column()
  declare walletAddress: string | null

  @column()
  declare isPrimary: boolean

  @column()
  declare isVerified: boolean

  @column.dateTime()
  declare verifiedAt: DateTime | null

  @column()
  declare metadata: any

  @column.dateTime()
  declare createdAt: DateTime

  @column.dateTime()
  declare updatedAt: DateTime
}
