import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'affiliate_links'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('affiliate_id').unsigned().references('id').inTable('users').notNullable()
      table.integer('product_id').unsigned().references('id').inTable('products').notNullable()
      table.string('product_name').nullable()
      table.string('link_code').unique().notNullable()
      table.integer('clicks').defaultTo(0)
      table.integer('conversions').defaultTo(0)
      table.decimal('revenue', 12, 2).defaultTo(0)
      table.decimal('commission_earned', 10, 2).defaultTo(0)
      table.enum('status', ['active', 'paused', 'expired']).defaultTo('active')
      table.string('sub_id').nullable()
      table.string('campaign_name').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}