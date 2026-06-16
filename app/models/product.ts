import { ProductSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type User from '#models/user'
import type Order from '#models/order'
import type AffiliateLink from '#models/affiliate_link'
import type Review from '#models/review'

export default class Product extends ProductSchema {
  @belongsTo(() => User, { foreignKey: 'vendorId' })
  declare vendor: User

  @hasMany(() => Order, { foreignKey: 'productId' })
  declare orders: Order[]

  @hasMany(() => AffiliateLink, { foreignKey: 'productId' })
  declare affiliateLinks: AffiliateLink[]

  @hasMany(() => Review, { foreignKey: 'productId' })
  declare reviews: Review[]
}