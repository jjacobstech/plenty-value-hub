import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import ShopifyProduct from '#models/shopify_product'

export default class ShopifyStore extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare vendorId: number

  @column()
  declare shopName: string

  @column()
  declare shopDomain: string

  @column()
  declare accessToken: string

  @column()
  declare refreshToken: string | null

  @column()
  declare apiVersion: string

  @column()
  declare scopes: string // JSON array of OAuth scopes

  @column()
  declare isConnected: boolean

  @column()
  declare connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error'

  @column()
  declare lastSyncAt: DateTime | null

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
  declare webhookId: string | null

  @column()
  declare storeSettings: string | null // JSON

  @column()
  declare errorLog: string | null // JSON array of recent errors

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

  @hasMany(() => ShopifyProduct, {
    foreignKey: 'shopifyStoreId',
  })
  declare products: HasMany<typeof ShopifyProduct>
}
