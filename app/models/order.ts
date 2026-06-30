import { OrderSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Product from '#models/product'
import AffiliateLink from '#models/affiliate_link'

export default class Order extends OrderSchema {
  @belongsTo(() => Product, { foreignKey: 'productId' })
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => User, { foreignKey: 'buyerId' })
  declare buyer: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'vendorId' })
  declare vendor: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'affiliateId' })
  declare affiliate: BelongsTo<typeof User>

  @belongsTo(() => AffiliateLink, { foreignKey: 'affiliateLinkId' })
  declare affiliateLink: BelongsTo<typeof AffiliateLink>
}
