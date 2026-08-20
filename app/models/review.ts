import { ReviewSchema } from '#database/schema'
import { belongsTo, column, beforeSave } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Product from '#models/product'
import crypto from 'node:crypto'

export default class Review extends ReviewSchema {
  @column()
  declare uuid: string

  @beforeSave()
  static async generateUuid(model: Review) {
    if (!model.uuid) {
      model.uuid = crypto.randomUUID()
    }
  }

  @belongsTo(() => Product, { foreignKey: 'productId' })
  declare product: BelongsTo<typeof Product>
}
