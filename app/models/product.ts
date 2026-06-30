import { ProductSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Order from '#models/order'
import AffiliateLink from '#models/affiliate_link'
import Review from '#models/review'

export default class Product extends ProductSchema {
  @belongsTo(() => User, { foreignKey: 'vendorId' })
  declare vendor: BelongsTo<typeof User>

  @hasMany(() => Order, { foreignKey: 'productId' })
  declare orders: HasMany<typeof Order>

  @hasMany(() => AffiliateLink, { foreignKey: 'productId' })
  declare affiliateLinks: HasMany<typeof AffiliateLink>

  @hasMany(() => Review, { foreignKey: 'productId' })
  declare reviews: HasMany<typeof Review>
}
