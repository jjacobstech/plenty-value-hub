import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import WoocommerceProduct from '#models/woocommerce_product'

export default class WoocommerceStore extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare vendorId: number

  @column()
  declare storeName: string

  @column()
  declare storeUrl: string

  @column()
  declare consumerKey: string

  @column()
  declare consumerSecret: string

  @column()
  declare apiVersion: string

  @column()
  declare isConnected: boolean

  @column()
  declare connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error'

  @column()
  declare lastSyncAt: DateTime | null

  @column()
  declare lastProductSyncAt: DateTime | null

  @column()
  declare lastOrderSyncAt: DateTime | null

  @column()
  declare syncFrequency: number // minutes

  @column()
  declare autoSync: boolean

  @column()
  declare totalProducts: number

  @column()
  declare totalOrders: number

  @column()
  declare totalRevenue: number

  @column()
  declare currency: string

  @column()
  declare webhookSecret: string | null

  @column()
  declare webhookUrl: string | null

  @column()
  declare storeSettings: string | null // JSON

  @column()
  declare errorLog: string | null // JSON array

  @column()
  declare lastErrorAt: DateTime | null

  @column()
  declare lastErrorMessage: string | null

  @column()
  declare connectedAt: DateTime | null

  @column()
  declare disconnectedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'vendorId',
  })
  declare vendor: BelongsTo<typeof User>

  @hasMany(() => WoocommerceProduct, {
    foreignKey: 'woocommerceStoreId',
  })
  declare products: HasMany<typeof WoocommerceProduct>
}
