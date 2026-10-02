import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import WoocommerceStore from '#models/woocommerce_store'

export default class WoocommerceProduct extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare woocommerceStoreId: number

  @column()
  declare wooProductId: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare sku: string | null

  @column()
  declare price: number

  @column()
  declare regularPrice: number | null

  @column()
  declare salePrice: number | null

  @column()
  declare currency: string

  @column()
  declare stockQty: number

  @column()
  declare vendorCommissionRate: number

  @column()
  declare affiliateCommissionRate: number

  @column()
  declare imageUrl: string | null

  @column()
  declare productUrl: string

  @column()
  declare status: 'draft' | 'pending' | 'private' | 'publish'

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
  declare dimensions: string | null // JSON: length, width, height

  @column()
  declare categories: string | null // JSON array of category IDs

  @column()
  declare tags: string | null // JSON array

  @column()
  declare attributes: string | null // JSON with product attributes

  @column()
  declare variations: string | null // JSON with variant data

  @column()
  declare rawData: string | null // JSON with full WooCommerce response

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => WoocommerceStore, {
    foreignKey: 'woocommerceStoreId',
  })
  declare store: BelongsTo<typeof WoocommerceStore>
}
