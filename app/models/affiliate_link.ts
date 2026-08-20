import { AffiliateLinkSchema } from '#database/schema'
import { belongsTo, hasMany, column, beforeSave } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Product from '#models/product'
import Order from '#models/order'
import crypto from 'node:crypto'

export default class AffiliateLink extends AffiliateLinkSchema {
  @column()
  declare uuid: string

  @beforeSave()
  static async generateUuid(model: AffiliateLink) {
    if (!model.uuid) {
      model.uuid = crypto.randomUUID()
    }
  }

  @belongsTo(() => User, { foreignKey: 'affiliateId' })
  declare affiliate: BelongsTo<typeof User>

  @belongsTo(() => Product, { foreignKey: 'productId' })
  declare product: BelongsTo<typeof Product>

  @hasMany(() => Order, { foreignKey: 'affiliateLinkId' })
  declare orders: HasMany<typeof Order>
}
