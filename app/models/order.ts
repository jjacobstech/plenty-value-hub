import { OrderSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type User from '#models/user'
import type Product from '#models/product'
import type AffiliateLink from '#models/affiliate_link'

export default class Order extends OrderSchema {
  @belongsTo(() => Product, { foreignKey: 'productId' })
  declare product: Product

  @belongsTo(() => User, { foreignKey: 'buyerId' })
  declare buyer: User

  @belongsTo(() => User, { foreignKey: 'vendorId' })
  declare vendor: User

  @belongsTo(() => User, { foreignKey: 'affiliateId' })
  declare affiliate: User | null

  @belongsTo(() => AffiliateLink, { foreignKey: 'affiliateLinkId' })
  declare affiliateLink: AffiliateLink | null
}