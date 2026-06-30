import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'reviews'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('product_id').unsigned().references('id').inTable('products').notNullable()
      table.string('product_name').nullable()
      table.string('reviewer_name').nullable()
      table.integer('rating').notNullable()
      table.string('title').nullable()
      table.text('content').notNullable()
      table.json('pros').nullable()
      table.json('cons').nullable()
      table.boolean('is_verified_purchase').defaultTo(false)
      table.enum('status', ['pending', 'approved', 'rejected']).defaultTo('pending')
      table.integer('helpful_count').defaultTo(0)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
