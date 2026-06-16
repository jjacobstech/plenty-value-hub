import { ReviewSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type Product from '#models/product'

export default class Review extends ReviewSchema {
  @belongsTo(() => Product, { foreignKey: 'productId' })
  declare product: Product
}