import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class CurrencySetting extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare currencyCode: string // ISO 4217: USD, EUR, GBP, etc.

  @column()
  declare currencyName: string

  @column()
  declare symbol: string

  @column()
  declare exchangeRate: number // rate relative to base currency (USD)

  @column()
  declare isActive: boolean

  @column()
  declare isBaseCurrency: boolean

  @column()
  declare decimalPlaces: number

  @column()
  declare symbolPosition: 'before' | 'after' // Position relative to amount

  @column()
  declare thousandsSeparator: string

  @column()
  declare decimalSeparator: string

  @column()
  declare countries: string | null // JSON array of country codes

  @column()
  declare regions: string | null // JSON array of region codes

  @column()
  declare lastRateUpdateAt: DateTime | null

  @column()
  declare rateSource: string | null // API source for rates (fixer.io, etc)

  @column()
  declare minPaymentAmount: number

  @column()
  declare paymentMethods: string | null // JSON array of supported payment methods

  @column()
  declare taxRate: number // VAT/GST percentage

  @column()
  declare taxIncluded: boolean

  @column()
  declare bankingDetails: string | null // JSON with bank info by currency

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
