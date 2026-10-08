import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, belongsTo } from '@adonisjs/lucid/orm'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import Click from '#models/click'
import Conversion from '#models/conversion'
import Campaign from '#models/campaign'
import Product from '#models/product'
import User from '#models/user'

export default class AffiliateLink extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'affiliate_id' })
  declare affiliateId: number

  @column({ columnName: 'product_id' })
  declare productId: number

  @column({ columnName: 'campaign_id' })
  declare campaignId: number

  @column({ columnName: 'slug' })
  declare slug: string

  @column({ columnName: 'token' })
  declare token: string

  @column({ columnName: 'link_code' })
  declare linkCode: string

  @column({ columnName: 'custom_alias' })
  declare customAlias: string | null

  @column({ columnName: 'description' })
  declare description: string | null

  @column({ columnName: 'status' })
  declare status: 'active' | 'inactive' | 'expired'

  @column({ columnName: 'revenue' })
  declare revenue: number

  @column({ columnName: 'commission_earned' })
  declare commissionEarned: number

  @column({ columnName: 'commission_rate' })
  declare commissionRate: number | null

  @column({ columnName: 'product_name' })
  declare productName: string | null

  @column.dateTime({ columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at' })
  declare updatedAt: DateTime

  @column.dateTime({ columnName: 'expires_at' })
  declare expiresAt: DateTime | null

  @column({ columnName: 'total_clicks' })
  declare totalClicks: number

  @column({ columnName: 'total_conversions' })
  declare totalConversions: number

  @column({ columnName: 'total_earnings' })
  declare totalEarnings: number

  @column({ columnName: 'is_active' })
  declare isActive: boolean

  @belongsTo(() => User, { foreignKey: 'affiliateId' })
  declare affiliate: BelongsTo<typeof User>

  @belongsTo(() => Product, { foreignKey: 'productId' })
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => Campaign, { foreignKey: 'campaignId' })
  declare campaign: BelongsTo<typeof Campaign>

  @hasMany(() => Click, { foreignKey: 'affiliateLinkId' })
  declare clicks: HasMany<typeof Click>

  @hasMany(() => Conversion, { foreignKey: 'affiliateLinkId' })
  declare conversions: HasMany<typeof Conversion>
}
