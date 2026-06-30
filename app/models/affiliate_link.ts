import { AffiliateLinkSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Product from '#models/product'
import Order from '#models/order'

export default class AffiliateLink extends AffiliateLinkSchema {
  @belongsTo(() => User, { foreignKey: 'affiliateId' })
  declare affiliate: BelongsTo<typeof User>

  @belongsTo(() => Product, { foreignKey: 'productId' })
  declare product: BelongsTo<typeof Product>

  @hasMany(() => Order, { foreignKey: 'affiliateLinkId' })
  declare orders: HasMany<typeof Order>
}
