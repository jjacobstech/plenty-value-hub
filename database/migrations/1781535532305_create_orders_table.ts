import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('order_number').unique().notNullable()
      table.integer('product_id').unsigned().references('id').inTable('products')
      table.string('product_name').nullable()
      table.integer('buyer_id').unsigned().references('id').inTable('users')
      table.string('buyer_email').nullable()
      table.integer('vendor_id').unsigned().references('id').inTable('users')
      table.integer('affiliate_id').unsigned().references('id').inTable('users').nullable()
      table
        .integer('affiliate_link_id')
        .unsigned()
        .references('id')
        .inTable('affiliate_links')
        .nullable()
      table.decimal('amount', 10, 2).notNullable()
      table.decimal('commission_amount', 10, 2).nullable()
      table.decimal('platform_fee', 10, 2).nullable()
      table.decimal('vendor_payout', 10, 2).nullable()
      table.enum('status', ['pending', 'completed', 'refunded', 'cancelled']).defaultTo('completed')
      table.string('payment_method').nullable()
      table.string('currency').defaultTo('USD')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
