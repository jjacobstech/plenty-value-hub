import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class CurrencyExchangeRate extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fromCurrency: string

  @column()
  declare toCurrency: string

  @column()
  declare rate: number

  @column()
  declare midRate: number | null

  @column()
  declare buyRate: number | null

  @column()
  declare sellRate: number | null

  @column()
  declare source: string

  @column()
  declare timestamp: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
