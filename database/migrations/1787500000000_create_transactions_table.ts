import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('uuid', 36).notNullable().unique()
      table.string('transaction_reference', 100).notNullable().unique().index()

      // User associated with this transaction (buyer, seller, or payout recipient)
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
        .nullable()

      // Transaction classification
      table
        .enum('type', ['purchase', 'sale', 'payout', 'commission', 'refund', 'transfer', 'deposit'])
        .notNullable()
      table.string('category', 50).notNullable()
      table
        .enum('status', ['pending', 'completed', 'failed', 'refunded', 'processing'])
        .notNullable()
        .defaultTo('completed')

      // Financials
      table.decimal('amount', 12, 2).notNullable()
      table.string('currency', 10).notNullable().defaultTo('USD')

      // Provider/Gateway info
      table.string('payment_method', 50).nullable()
      table.string('payment_gateway_reference', 100).nullable()

      // Related Entity Foreign Keys
      table
        .integer('order_id')
        .unsigned()
        .references('id')
        .inTable('orders')
        .onDelete('SET NULL')
        .nullable()
      table
        .integer('payout_request_id')
        .unsigned()
        .references('id')
        .inTable('payout_requests')
        .onDelete('SET NULL')
        .nullable()
      table
        .integer('product_id')
        .unsigned()
        .references('id')
        .inTable('products')
        .onDelete('SET NULL')
        .nullable()

      table.text('description').nullable()
      table.text('metadata').nullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
