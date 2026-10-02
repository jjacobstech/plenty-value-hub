import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class RegionalPricing extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare productId: number

  @column()
  declare region: string // country code or region

  @column()
  declare currency: string

  @column()
  declare basePrice: number

  @column()
  declare localPrice: number

  @column()
  declare pricingStrategy: 'fixed' | 'percentage' | 'dynamic' // How price was set

  @column()
  declare adjustment: number | null // percentage or fixed amount adjustment

  @column()
  declare taxRate: number

  @column()
  declare discountRate: number | null

  @column()
  declare shippingCost: number | null

  @column()
  declare isActive: boolean

  @column()
  declare validFrom: DateTime

  @column()
  declare validUntil: DateTime | null

  @column()
  declare demandMultiplier: number // 1.0 = no adjustment, 1.2 = 20% premium

  @column()
  declare competitorPricing: string | null // JSON with competitor prices

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
