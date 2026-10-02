import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ShopifyStore from '#models/shopify_store'

export default class ShopifyProduct extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare shopifyStoreId: number

  @column()
  declare shopifyProductId: string // Shopify's product ID

  @column()
  declare shopifyVariantId: string | null

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare sku: string | null

  @column()
  declare price: number

  @column()
  declare compareAtPrice: number | null

  @column()
  declare currency: string

  @column()
  declare inventoryQty: number

  @column()
  declare vendorCommissionRate: number // percentage

  @column()
  declare affiliateCommissionRate: number // percentage

  @column()
  declare imageUrl: string | null

  @column()
  declare shopifyUrl: string

  @column()
  declare status: 'draft' | 'active' | 'archived'

  @column()
  declare syncStatus: 'pending' | 'synced' | 'error'

  @column()
  declare isSyncedToHub: boolean

  @column()
  declare lastSyncedAt: DateTime | null

  @column()
  declare totalSales: number

  @column()
  declare totalAffiliateRevenue: number

  @column()
  declare totalCommissionPaid: number

  @column()
  declare weight: number | null

  @column()
  declare weightUnit: string | null

  @column()
  declare variantTitle: string | null

  @column()
  declare collections: string | null // JSON array of collection IDs

  @column()
  declare tags: string | null // JSON array

  @column()
  declare options: string | null // JSON with variant options

  @column()
  declare rawData: string | null // JSON with full Shopify response

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => ShopifyStore, {
    foreignKey: 'shopifyStoreId',
  })
  declare store: BelongsTo<typeof ShopifyStore>
}
