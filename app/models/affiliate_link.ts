import { AffiliateLinkSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type User from '#models/user'
import type Product from '#models/product'
import type Order from '#models/order'

export default class AffiliateLink extends AffiliateLinkSchema {
  @belongsTo(() => User, { foreignKey: 'affiliateId' })
  declare affiliate: User

  @belongsTo(() => Product, { foreignKey: 'productId' })
  declare product: Product

  @hasMany(() => Order, { foreignKey: 'affiliateLinkId' })
  declare orders: Order[]
}